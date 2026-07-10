import os
from databricks.sdk import WorkspaceClient

_COLUMNS = ["id", "name", "description", "context_length", "pricing_input", "pricing_output"]


def query_vector_search(query_text: str, num_results: int = 5) -> list[dict]:
    client = WorkspaceClient()
    index_name = os.environ["VECTOR_SEARCH_INDEX_NAME"]

    response = client.vector_search_indexes.query_index(
        index_name=index_name,
        columns=_COLUMNS,
        query_text=query_text,
        num_results=num_results,
    )

    if not (response.result and response.result.data_array):
        return []

    column_names = [col.name for col in response.result.manifest.columns]
    return [dict(zip(column_names, row)) for row in response.result.data_array]
