.PHONY: setup dev dev-backend dev-frontend test test-backend test-frontend lint format build deploy

setup:
	pip install -e ".[dev]"
	cd frontend && npm install

dev:
	@trap 'kill %1 %2 2>/dev/null; exit' INT; \
	cd services/backend && uvicorn app.main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait

dev-backend:
	cd services/backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test: test-backend test-frontend

test-backend:
	pytest tests/backend/

test-frontend:
	cd frontend && npm run test

lint:
	ruff check .
	ruff format --check .

format:
	ruff format .

build:
	cd frontend && npm run build

deploy:
	databricks bundle deploy
