# RAG Agent — Model Recommendation Engine

A Databricks App that recommends AI models for user-described tasks. Describe what you want to build; the agent decomposes it into subtasks and recommends the best model/provider for each, grounded in live data from the [OpenRouter](https://openrouter.ai) catalog.

**This is a recommendation system, not a multi-model executor.** Only Claude (via OpenRouter) is called for generation. Other models (Gemini, Llama, Mistral, etc.) are recommended, not invoked.

---

## Architecture

```
User message
  └─ Vector Search (top-5 model chunks from openrouter_models)
       └─ System prompt + context + history
            └─ OpenRouter SSE (claude-haiku-4-5 )
                 └─ Streamed tokens → RecommendationCard (parsed JSON plan)
```

A single `uvicorn` process serves both the FastAPI backend (`/api/*`) and the React static build (`/*`). In development, Vite proxies `/api` to `localhost:8000`.

---

## Development

### Prerequisites

- [uv](https://docs.astral.sh/uv/) — Python package manager
- Node.js 20+
- A Databricks workspace with Vector Search enabled

### Setup

```bash
make setup
```

This installs Python deps (`uv sync --extra dev`) and frontend deps (`npm install`).

### Running locally

Ensure `.env` exists (created automatically by `make setup` from `.env.example`). The dev commands load it automatically.

```bash
# Backend only (port 8000)
make dev-backend

# Frontend only (port 5173, proxies /api → 8000)
make dev-frontend

# Both together
make dev
```

### Tests

```bash
make test          # backend + frontend
make test-backend  # pytest (15 tests)
make test-frontend # vitest (7 tests)
```

### Ingestion

```bash
make ingest   # run openrouter_ingestion job on the existing cluster
```

Requires `DATABRICKS_CLUSTER_ID` in `.env`.

### Lint / Format

```bash
make lint    # ruff check + ruff format --check
make format  # ruff format (auto-fix)
```

---

## Project Structure

```
rag-project/
├── app.yaml                        # Databricks Apps runtime config
├── databricks.yml                  # Asset Bundle: app + ingestion job
├── pyproject.toml                  # Python deps + pytest config
├── Makefile
├── services/backend/app/
│   ├── main.py                     # FastAPI: /api/health, /api/chat, static mount
│   ├── chat.py                     # retrieve → build prompt → stream
│   └── retrieval.py                # Databricks Vector Search client
├── jobs/ingestion/
│   └── ingest.py                   # OpenRouter fetch → Delta table → VS sync
├── frontend/src/
│   ├── services/api.ts             # streamChat SSE client
│   ├── hooks/useChat.ts            # all conversation state
│   ├── pages/ChatPage.tsx
│   └── components/
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       ├── ErrorBanner.tsx
│       └── RecommendationCard.tsx
└── tests/
    ├── backend/                    # pytest
    └── frontend/                   # vitest
```

---

## Data Pipeline

The ingestion job (`jobs/ingestion/ingest.py`) runs on demand:

1. Fetches all models from `GET https://openrouter.ai/api/v1/models` (public, no auth)
2. Normalizes records (id, name, description, context_length, pricing, ingested_at)
3. Overwrites the Delta table `{catalog}.{schema}.openrouter_models` (full refresh)
4. Triggers a Vector Search Delta Sync Index sync

The job runs on an **existing cluster** (passed via the `cluster_id` bundle variable). Catalog, schema, table, and index are passed as positional CLI arguments — not environment variables.

Run via: `make ingest`, **Databricks Jobs UI**, or `databricks bundle run openrouter_ingestion`.

---

## Environment Variables

### App (injected via Databricks Apps secrets from scope `my-secret-scope`)

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API calls |
| `DATABRICKS_HOST` | WorkspaceClient for Vector Search |
| `VECTOR_SEARCH_ENDPOINT_NAME` | VS endpoint to query |
| `VECTOR_SEARCH_INDEX_NAME` | Fully qualified index name (`catalog.schema.index`) |

> **Do not set `DATABRICKS_TOKEN`** — Databricks Apps injects OAuth credentials automatically. Adding a PAT causes "more than one authorization method configured".

### Local dev / deployment (`.env`)

| Variable | Purpose |
|---|---|
| `DATABRICKS_HOST` | Workspace URL for `databricks` CLI |
| `DATABRICKS_CLUSTER_ID` | Existing cluster used by the ingestion job |

### Ingestion job (bundle variables set in `databricks.yml`)

The ingestion job receives catalog, schema, table, endpoint, and index as positional CLI arguments — not environment variables. These are sourced from bundle variables (`unity_catalog`, `unity_schema`, `unity_table`, `vs_endpoint_name`, `vs_index_name`) defined in `databricks.yml`.

---

## Deployment

```bash
# Build frontend first
make build

# Deploy app + ingestion job to Databricks, then push app files
make deploy
```

`make deploy` runs `databricks bundle deploy` (uploads bundle resources) followed by `databricks apps deploy` (pushes the app source files to the workspace). It reads `DATABRICKS_CLUSTER_ID` from `.env` to bind the ingestion job to an existing cluster.

After deploying, grant the app's service principal Unity Catalog permissions:

```sql
GRANT USE CATALOG ON CATALOG {catalog} TO `{app-service-principal}`;
GRANT USE SCHEMA ON SCHEMA {catalog}.{schema} TO `{app-service-principal}`;
GRANT SELECT ON TABLE {catalog}.{schema}.openrouter_models TO `{app-service-principal}`;
GRANT MODIFY ON TABLE {catalog}.{schema}.openrouter_models TO `{app-service-principal}`;
```
