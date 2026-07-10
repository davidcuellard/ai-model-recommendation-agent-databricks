# RAG Agent Design — Multi-Model Recommendation Engine

**Date:** 2026-07-09  
**Status:** Approved  
**Project root:** `rag-project/`

---

## 1. Purpose

A Databricks App that acts as a model recommendation agent. The user describes what they want to build; the agent decomposes the task into subtasks and recommends the best AI model/provider for each one, grounded in live data from the OpenRouter model catalog.

This is a recommendation system, not a multi-model executor. The agent calls only Claude (via OpenRouter) for generation. It recommends other models (Gemini, Llama, Mistral, etc.) but does not call them.

---

## 2. Data Pipeline

### Source

| Source | Endpoint | Auth |
|---|---|---|
| OpenRouter model catalog | `GET https://openrouter.ai/api/v1/models` | None (public) |

### Delta Table

```
{catalog}.{schema}.openrouter_models
```

Columns derived from the API response:
- `id` — model identifier (e.g. `anthropic/claude-haiku-4-5 `)
- `name` — display name
- `description` — provider-supplied description
- `context_length` — max context window (tokens)
- `pricing_input` — cost per 1M input tokens (USD)
- `pricing_output` — cost per 1M output tokens (USD)
- `top_provider` — boolean flag from OpenRouter
- `ingested_at` — timestamp of last fetch

### Vector Search Index

Built over `openrouter_models`. Each row is one model. The indexed text column is a synthesized chunk:

> *"Model: claude-haiku-4-5  by Anthropic. Description: [description]. Context window: 200,000 tokens. Input cost: $3/1M tokens, Output cost: $15/1M tokens."*

The index is a **Delta Sync Index** (managed by Databricks Vector Search), triggered to sync after each ingestion run.

### Ingestion Job (Databricks Bundle Job)

Located at `jobs/ingestion/ingest.py`. Steps:
1. `GET https://openrouter.ai/api/v1/models` — no auth required
2. Normalize response into flat records
3. Overwrite Delta table (full refresh — source is authoritative)
4. Trigger Vector Search index sync via SDK

Configured as a Databricks Job in `databricks.yml` with a Python task. Runs on demand (no schedule for now).

---

## 3. Backend

### Technology

- **FastAPI** — HTTP server and SSE streaming
- **Databricks SDK** (`WorkspaceClient()`, no explicit token — OAuth injected by Databricks Apps)
- **OpenRouter** — single generation provider, accessed via the OpenAI-compatible API

### Environment Variables (injected via Databricks Apps secrets)

| Variable | Used by | Source |
|---|---|---|
| `OPENROUTER_API_KEY` | Backend — OpenRouter calls | Secret scope `my-secret-scope` |
| `DATABRICKS_HOST` | Backend — `WorkspaceClient()` for Vector Search | Secret scope `my-secret-scope` |
| `VECTOR_SEARCH_ENDPOINT_NAME` | Backend — VS endpoint to query | Secret scope `my-secret-scope` |
| `VECTOR_SEARCH_INDEX_NAME` | Backend — fully qualified index (`catalog.schema.openrouter_models_index`) | Secret scope `my-secret-scope` |

**Not set:**
- `DATABRICKS_TOKEN` — Databricks Apps injects OAuth credentials automatically (`DATABRICKS_CLIENT_ID` / `DATABRICKS_CLIENT_SECRET`). Adding a PAT causes "more than one authorization method configured" error.
- `DATABRICKS_WAREHOUSE_ID` — not needed. The app queries Vector Search directly via SDK; no SQL warehouse required.

**Ingestion job env vars** (set in `databricks.yml` job config, not in the app):

| Variable | Purpose |
|---|---|
| `UNITY_CATALOG` | Target catalog name |
| `UNITY_SCHEMA` | Target schema name |
| `UNITY_TABLE` | Target table name (e.g. `openrouter_models`) |
| `VECTOR_SEARCH_ENDPOINT_NAME` | VS endpoint to sync after ingestion |
| `VECTOR_SEARCH_INDEX_NAME` | VS index to sync |

### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/chat` | Main chat endpoint — accepts history, returns SSE stream |
| `GET` | `/api/health` | Health check |
| `GET` | `/*` | Serves React static build |

### `POST /api/chat` — Request / Response

**Request body:**
```json
{
  "messages": [
    { "role": "user", "content": "I want to build a chatbot with test coverage and a hero image." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:** `text/event-stream` (SSE). Each event is a token. Claude streams a response that ends with a JSON block:

```
data: {"token": "For your use case, I recommend...\n\n"}
data: {"token": "```json\n{\"plan\": [...]}```"}
data: {"done": true}
```

### Request Flow

```
POST /api/chat (messages[])
  ├─ Extract latest user message
  ├─ retrieval.py: query Vector Search index → top-5 model chunks
  ├─ chat.py: build prompt
  │     system: instructions to decompose task + produce JSON plan
  │     context: retrieved model chunks
  │     history: full messages[]
  ├─ OpenRouter SSE call (claude-haiku-4-5 )
  └─ Proxy SSE tokens → client
```

### Model Selection

- **Routing / classification:** Not a separate call. Claude Sonnet handles both reasoning and output in one streaming call.
- **Fallback:** If Vector Search returns no results, Claude still produces a recommendation based on its training knowledge (with a disclaimer in the response).

### Output Schema

Claude is instructed (via system prompt) to end every response with a JSON block:

```json
{
  "plan": [
    {
      "subtask": "chatbot logic",
      "model": "claude-haiku-4-5 ",
      "provider": "Anthropic via OpenRouter",
      "reason": "agentic coding, tool calling"
    },
    {
      "subtask": "test coverage",
      "model": "claude-haiku-4-5",
      "provider": "Anthropic via OpenRouter",
      "reason": "high volume, low complexity, cost-efficient"
    },
    {
      "subtask": "hero image",
      "model": "google/gemini-2.0-flash",
      "provider": "Google via OpenRouter",
      "reason": "image generation specialty"
    }
  ],
  "summary": "For your product recommendation feature..."
}
```

### File Layout

```
services/backend/app/
├── main.py        # FastAPI app: routes, static file mount, CORS for dev
├── chat.py        # Orchestration: retrieve → build prompt → stream
└── retrieval.py   # Databricks Vector Search client (WorkspaceClient)
```

---

## 4. Frontend

### Technology

- React 18 + Vite + TypeScript
- Tailwind CSS v4 for styling
- Vitest for unit tests

### State Management — `useChat` hook

The hook owns all conversation state:

```typescript
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Hook state
messages: Message[]       // full history, sent to backend on each turn
isStreaming: boolean      // true while SSE stream is open
error: string | null      // network/API error message
```

On send:
1. Append user message to `messages`
2. Set `isStreaming = true`
3. Open SSE stream to `POST /api/chat` with full `messages`
4. Append each token to the current assistant message
5. On `{"done": true}` — parse the trailing JSON block, set `isStreaming = false`
6. On error — set `error`, set `isStreaming = false`

### Component Tree

```
ChatPage
├── MessageList
│   └── ChatMessage (× n)
│       ├── text content (streaming, rendered as markdown)
│       └── RecommendationCard (parsed from JSON block, shown after stream ends)
├── ErrorBanner (shown when error !== null, dismissible)
└── ChatInput
    ├── textarea (disabled while isStreaming)
    └── send button (disabled while isStreaming)
```

### UX States

| State | UI |
|---|---|
| Idle | Input enabled, send button active |
| Streaming | Input disabled, animated "thinking..." bubble appears immediately |
| Error | ErrorBanner shown above input, input re-enabled |
| Done | RecommendationCard rendered below assistant text |

### Services Layer

`src/services/api.ts` — all backend calls live here. Components never fetch directly.

```typescript
// In dev: Vite proxies /api/* → localhost:8000
// In prod: same origin, FastAPI serves static files
streamChat(messages: Message[], onToken: (t: string) => void, onDone: () => void, onError: (e: string) => void): () => void
```

Returns an abort function so `useChat` can cancel on unmount.

### Local Development

```bash
# Terminal 1 — backend
cd services/backend && uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend && npm run dev   # Vite on :5173, proxies /api/* → :8000
```

Vite config proxies `/api` to `http://localhost:8000` — no CORS config needed in dev.

---

## 5. Deployment

### `app.yaml`

```yaml
command:
  - "uvicorn"
  - "app.main:app"
  - "--app-dir"
  - "services/backend"
  - "--host"
  - "0.0.0.0"
  - "--port"
  - "8000"

env:
  - name: OPENROUTER_API_KEY
    valueFrom: "OPENROUTER_API_KEY"
  - name: DATABRICKS_HOST
    valueFrom: "DATABRICKS_HOST"
  - name: VECTOR_SEARCH_ENDPOINT_NAME
    valueFrom: "VECTOR_SEARCH_ENDPOINT_NAME"
  - name: VECTOR_SEARCH_INDEX_NAME
    valueFrom: "VECTOR_SEARCH_INDEX_NAME"
```

### `databricks.yml` Resources

- **App** (`my-rag-app`): `source_code_path: ./`
- **Job** (`openrouter-ingestion`): Python task running `jobs/ingestion/ingest.py`, with env vars `UNITY_CATALOG`, `UNITY_SCHEMA`, `UNITY_TABLE`, `VECTOR_SEARCH_ENDPOINT_NAME`, `VECTOR_SEARCH_INDEX_NAME` set in the job task config
- **Secrets** (app): `OPENROUTER_API_KEY`, `DATABRICKS_HOST`, `VECTOR_SEARCH_ENDPOINT_NAME`, `VECTOR_SEARCH_INDEX_NAME` — all from scope `my-secret-scope`
- No SQL warehouse resource needed

Deploy with: `databricks bundle deploy`

After deploy, grant the app's service principal Unity Catalog permissions via SQL:
```sql
GRANT USE CATALOG ON CATALOG {catalog} TO `{app-service-principal}`;
GRANT USE SCHEMA ON SCHEMA {catalog}.{schema} TO `{app-service-principal}`;
GRANT SELECT ON TABLE {catalog}.{schema}.openrouter_models TO `{app-service-principal}`;
GRANT MODIFY ON TABLE {catalog}.{schema}.openrouter_models TO `{app-service-principal}`;
```

---

## 6. Testing

### Backend (pytest)

```
tests/backend/
├── test_retrieval.py   # Vector Search client — mocked WorkspaceClient
├── test_chat.py        # /api/chat endpoint — mocked OpenRouter + retrieval
└── test_ingestion.py   # ingestion job — mocked HTTP response + Databricks SDK
```

### Frontend (Vitest)

```
tests/frontend/
└── useChat.test.ts     # hook state: send → streaming → done, send → error
```

### Running Tests

```bash
# Backend
cd rag-project && pytest tests/backend/

# Frontend
cd frontend && npm run test
```

---

## 7. Project Structure (Final)

```
rag-project/
├── app.yaml
├── databricks.yml
├── pyproject.toml
├── README.md
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-07-09-rag-agent-design.md
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ChatMessage.tsx
│       │   ├── ChatInput.tsx
│       │   ├── ErrorBanner.tsx
│       │   └── RecommendationCard.tsx
│       ├── pages/
│       │   └── ChatPage.tsx
│       ├── hooks/
│       │   └── useChat.ts
│       └── services/
│           └── api.ts
├── services/
│   └── backend/
│       └── app/
│           ├── main.py
│           ├── chat.py
│           └── retrieval.py
├── jobs/
│   └── ingestion/
│       └── ingest.py
└── tests/
    ├── backend/
    │   ├── test_retrieval.py
    │   ├── test_chat.py
    │   └── test_ingestion.py
    └── frontend/
        └── useChat.test.ts
```
