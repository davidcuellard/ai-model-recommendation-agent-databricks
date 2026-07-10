.PHONY: setup dev dev-backend dev-frontend test test-backend test-frontend lint format build deploy ingest

setup:
	@[ -f .env ] || cp .env.example .env
	uv sync --extra dev
	cd frontend && npm install

dev:
	@set -a && . ./.env && set +a && trap 'kill %1 %2 2>/dev/null; exit' INT; \
	cd services/backend && uv run uvicorn app.main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait

dev-backend:
	@set -a && . ./.env && set +a && cd services/backend && uv run uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test: test-backend test-frontend

test-backend:
	uv run pytest tests/backend/

test-frontend:
	cd frontend && npm run test

lint:
	uv run ruff check .
	uv run ruff format --check .

format:
	uv run ruff format .

build:
	cd frontend && npm run build

deploy:
	@set -a && . ./.env && set +a && BUNDLE_VAR_cluster_id=$$DATABRICKS_CLUSTER_ID databricks bundle deploy
	databricks workspace import-dir frontend/dist /Workspace/Users/david.cuellar@factored.ai/.bundle/rag-agent/default/files/frontend/dist --overwrite
	databricks apps deploy rag-agent --source-code-path /Workspace/Users/david.cuellar@factored.ai/.bundle/rag-agent/default/files

ingest:
	@set -a && . ./.env && set +a && BUNDLE_VAR_cluster_id=$$DATABRICKS_CLUSTER_ID databricks bundle run openrouter_ingestion
