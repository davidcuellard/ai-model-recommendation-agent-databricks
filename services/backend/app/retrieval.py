import json
import os
from databricks.sdk import WorkspaceClient

_COLUMNS = [
    "id",
    "name",
    "description",
    "context_length",
    "pricing_input",
    "pricing_output",
    "provider",
]


def query_vector_search(
    query_text: str, num_results: int = 5, companies: list[str] | None = None
) -> list[dict]:
    client = WorkspaceClient()
    index_name = os.environ["VECTOR_SEARCH_INDEX_NAME"]

    filters_json = None
    if companies:
        filters_json = json.dumps({"provider": companies})

    response = client.vector_search_indexes.query_index(
        index_name=index_name,
        columns=_COLUMNS,
        query_text=query_text,
        num_results=num_results,
        filters_json=filters_json,
    )

    if not (response.result and response.result.data_array):
        return []

    column_names = [col.name for col in response.manifest.columns]
    return [dict(zip(column_names, row)) for row in response.result.data_array]


def get_all_providers() -> list[str]:
    client = WorkspaceClient()
    index_name = os.environ["VECTOR_SEARCH_INDEX_NAME"]

    response = client.vector_search_indexes.query_index(
        index_name=index_name,
        columns=["provider"],
        query_text="model",
        num_results=200,
    )

    if not (response.result and response.result.data_array):
        return []

    column_names = [col.name for col in response.manifest.columns]
    rows = [dict(zip(column_names, row)) for row in response.result.data_array]
    providers = sorted({r["provider"] for r in rows if r.get("provider")})
    return providers
