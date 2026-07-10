# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Databricks App** that acts as a model recommendation agent. Users describe what they want to build; the agent decomposes the task into subtasks and recommends the best AI model/provider for each, grounded in live data from the OpenRouter model catalog.

**Key distinction:** This is a recommendation system, not a multi-model executor. Only Claude (via OpenRouter) is called for generation. Other models are recommended, not invoked.

## Development Commands

```bash
# Backend (Terminal 1)
cd services/backend && uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 2)
cd frontend && npm run dev   # Vite on :5173, proxies /api/* → :8000

# Backend tests
pytest tests/backend/

# Run a single backend test file
pytest tests/backend/test_chat.py

# Frontend tests
cd frontend && npm run test

# Deploy
databricks bundle deploy
```

## Architecture

### Data Pipeline

OpenRouter public API (`GET https://openrouter.ai/api/v1/models`) → `jobs/ingestion/ingest.py` → Delta table `{catalog}.{schema}.openrouter_models` → Vector Search Delta Sync Index.

The ingestion job does a **full refresh** (source is authoritative) and triggers an index sync after each run. No schedule — run on demand.

### Request Flow (`POST /api/chat`)

```
messages[] → extract latest user message
           → retrieval.py: query Vector Search → top-5 model chunks
           → chat.py: build prompt (system + context + history)
           → OpenRouter SSE call (claude-haiku-4-5 )
           → proxy SSE tokens → client
```

Response is `text/event-stream`. Claude streams text ending with a JSON block (`{"plan": [...], "summary": "..."}`) parsed by the frontend into `RecommendationCard`.

### Backend (`services/backend/app/`)

- `main.py` — FastAPI app, routes, CORS for dev, static file mount (serves React build in prod)
- `chat.py` — orchestration: retrieve → build prompt → stream
- `retrieval.py` — Databricks Vector Search client via `WorkspaceClient()`

`WorkspaceClient()` uses no explicit token — Databricks Apps injects OAuth credentials automatically (`DATABRICKS_CLIENT_ID` / `DATABRICKS_CLIENT_SECRET`). **Do not set `DATABRICKS_TOKEN`** — it causes "more than one authorization method configured".

### Frontend (`frontend/src/`)

- `hooks/useChat.ts` — owns all conversation state (`messages`, `isStreaming`, `error`)
- `services/api.ts` — all backend calls; components never fetch directly. Returns an abort function for SSE cancellation on unmount.
- `pages/ChatPage.tsx` → `MessageList` → `ChatMessage` + `RecommendationCard`, `ErrorBanner`, `ChatInput`

In dev, Vite proxies `/api/*` → `localhost:8000` — no CORS config needed. In prod, FastAPI serves the React static build from the same origin.

### Environment Variables

**App (injected via Databricks Apps secrets from scope `my-secret-scope`):**

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API calls |
| `DATABRICKS_HOST` | WorkspaceClient for Vector Search |
| `VECTOR_SEARCH_ENDPOINT_NAME` | VS endpoint to query |
| `VECTOR_SEARCH_INDEX_NAME` | Fully qualified index name |

**Ingestion job (set in `databricks.yml` job task config, not in the app):**

| Variable | Purpose |
|---|---|
| `UNITY_CATALOG` / `UNITY_SCHEMA` / `UNITY_TABLE` | Target Delta table location |
| `VECTOR_SEARCH_ENDPOINT_NAME` / `VECTOR_SEARCH_INDEX_NAME` | Index to sync after ingestion |

## Deployment Notes

After `databricks bundle deploy`, grant Unity Catalog permissions to the app's service principal:
```sql
GRANT USE CATALOG ON CATALOG {catalog} TO `{app-service-principal}`;
GRANT USE SCHEMA ON SCHEMA {catalog}.{schema} TO `{app-service-principal}`;
GRANT SELECT ON TABLE {catalog}.{schema}.openrouter_models TO `{app-service-principal}`;
GRANT MODIFY ON TABLE {catalog}.{schema}.openrouter_models TO `{app-service-principal}`;
```

No SQL warehouse is needed — Vector Search queries go directly via the SDK.

## Design Spec

Full design document: `docs/superpowers/specs/2026-07-09-rag-agent-design.md`
