.PHONY: setup dev dev-backend dev-frontend test test-backend test-frontend lint format build deploy

setup:
	@[ -f .env ] || cp .env.example .env
	uv sync --extra dev
	cd frontend && npm install

dev:
	@trap 'kill %1 %2 2>/dev/null; exit' INT; \
	cd services/backend && uv run uvicorn app.main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait

dev-backend:
	cd services/backend && uv run uvicorn app.main:app --reload --port 8000

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
	databricks bundle deploy
