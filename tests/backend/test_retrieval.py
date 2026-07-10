from unittest.mock import patch, MagicMock

from app.retrieval import query_vector_search


def _make_mock_response(rows: list[list]) -> MagicMock:
    col_names = [
        "id",
        "name",
        "description",
        "context_length",
        "pricing_input",
        "pricing_output",
        "provider",
    ]
    cols = [MagicMock() for _ in col_names]
    for col, name in zip(cols, col_names):
        col.name = name

    manifest = MagicMock()
    manifest.columns = cols

    result = MagicMock()
    result.data_array = rows if rows else None

    response = MagicMock()
    response.result = result
    response.manifest = manifest
    return response


def test_query_returns_formatted_dicts(monkeypatch):
    monkeypatch.setenv("VECTOR_SEARCH_INDEX_NAME", "cat.schema.idx")
    row = [
        "anthropic/claude-haiku-4-5 ",
        "Claude Sonnet",
        "Powerful",
        200000,
        0.000003,
        0.000015,
        "anthropic",
    ]
    mock_response = _make_mock_response([row])

    with patch("app.retrieval.WorkspaceClient") as mock_wc_cls:
        mock_wc = MagicMock()
        mock_wc_cls.return_value = mock_wc
        mock_wc.vector_search_indexes.query_index.return_value = mock_response

        results = query_vector_search("build a chatbot")

    assert len(results) == 1
    assert results[0]["id"] == "anthropic/claude-haiku-4-5 "
    assert results[0]["pricing_input"] == 0.000003


def test_query_passes_correct_args(monkeypatch):
    monkeypatch.setenv("VECTOR_SEARCH_INDEX_NAME", "cat.schema.idx")
    mock_response = _make_mock_response([])

    with patch("app.retrieval.WorkspaceClient") as mock_wc_cls:
        mock_wc = MagicMock()
        mock_wc_cls.return_value = mock_wc
        mock_wc.vector_search_indexes.query_index.return_value = mock_response

        query_vector_search("test", num_results=3)

        mock_wc.vector_search_indexes.query_index.assert_called_once_with(
            index_name="cat.schema.idx",
            columns=[
                "id",
                "name",
                "description",
                "context_length",
                "pricing_input",
                "pricing_output",
                "provider",
            ],
            query_text="test",
            num_results=3,
            filters_json=None,
        )


def test_query_returns_empty_list_when_no_data(monkeypatch):
    monkeypatch.setenv("VECTOR_SEARCH_INDEX_NAME", "cat.schema.idx")
    mock_response = _make_mock_response([])

    with patch("app.retrieval.WorkspaceClient") as mock_wc_cls:
        mock_wc = MagicMock()
        mock_wc_cls.return_value = mock_wc
        mock_wc.vector_search_indexes.query_index.return_value = mock_response

        results = query_vector_search("test")

    assert results == []
