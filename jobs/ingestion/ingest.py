import sys
import httpx
from datetime import datetime, timezone
from databricks.sdk import WorkspaceClient

OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models"


def fetch_models() -> list[dict]:
    with httpx.Client(timeout=30) as client:
        response = client.get(OPENROUTER_MODELS_URL)
        response.raise_for_status()
        return response.json()["data"]


def normalize_model(model: dict) -> dict:
    pricing = model.get("pricing") or {}
    model_id = model.get("id", "")
    provider = model_id.split("/")[0] if "/" in model_id else ""
    return {
        "id": model_id,
        "name": model.get("name", ""),
        "description": model.get("description", ""),
        "context_length": model.get("context_length"),
        "pricing_input": float(pricing.get("prompt") or 0),
        "pricing_output": float(pricing.get("completion") or 0),
        "top_provider": bool(model.get("top_provider")),
        "provider": provider,
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }


def write_to_delta(records: list[dict], catalog: str, schema: str, table: str) -> None:
    from pyspark.sql import SparkSession

    spark = SparkSession.builder.getOrCreate()
    df = spark.createDataFrame(records)
    df.write.mode("overwrite").saveAsTable(f"{catalog}.{schema}.{table}")


def sync_vector_search_index(index_name: str) -> None:
    client = WorkspaceClient()
    client.vector_search_indexes.sync_index(index_name=index_name)


def main() -> None:
    catalog, schema, table, _endpoint, index_name = sys.argv[1:6]

    print("Fetching models from OpenRouter...")
    raw_models = fetch_models()
    print(f"Fetched {len(raw_models)} models")

    records = [normalize_model(m) for m in raw_models]

    print(f"Writing to {catalog}.{schema}.{table}...")
    write_to_delta(records, catalog, schema, table)

    print(f"Syncing Vector Search index {index_name}...")
    sync_vector_search_index(index_name)
    print("Done.")


if __name__ == "__main__":
    main()
