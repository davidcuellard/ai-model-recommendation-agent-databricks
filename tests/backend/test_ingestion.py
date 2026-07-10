from unittest.mock import patch, MagicMock

from jobs.ingestion.ingest import fetch_models, normalize_model, sync_vector_search_index


def test_fetch_models_returns_list():
    mock_data = {
        "data": [
            {
                "id": "anthropic/claude-haiku-4-5 ",
                "name": "Claude Sonnet",
                "description": "A powerful model",
                "context_length": 200000,
                "pricing": {"prompt": "0.000003", "completion": "0.000015"},
                "top_provider": True,
            }
        ]
    }
    mock_resp = MagicMock()
    mock_resp.json.return_value = mock_data

    with patch("httpx.Client") as mock_client_cls:
        mock_http = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_http
        mock_http.get.return_value = mock_resp

        result = fetch_models()

    assert len(result) == 1
    assert result[0]["id"] == "anthropic/claude-haiku-4-5 "


def test_normalize_model_extracts_all_fields():
    raw = {
        "id": "anthropic/claude-haiku-4-5",
        "name": "Claude Haiku",
        "description": "Fast and cheap",
        "context_length": 200000,
        "pricing": {"prompt": "0.00000025", "completion": "0.00000125"},
        "top_provider": False,
    }
    result = normalize_model(raw)

    assert result["id"] == "anthropic/claude-haiku-4-5"
    assert result["name"] == "Claude Haiku"
    assert result["description"] == "Fast and cheap"
    assert result["context_length"] == 200000
    assert result["pricing_input"] == 0.00000025
    assert result["pricing_output"] == 0.00000125
    assert result["top_provider"] is False
    assert "ingested_at" in result


def test_normalize_model_handles_missing_pricing():
    raw = {"id": "test/model", "name": "Test", "description": "", "context_length": 4096}
    result = normalize_model(raw)
    assert result["pricing_input"] == 0.0
    assert result["pricing_output"] == 0.0


def test_normalize_model_handles_null_pricing_values():
    raw = {
        "id": "test/model",
        "name": "Test",
        "description": "",
        "context_length": 4096,
        "pricing": {"prompt": None, "completion": None},
    }
    result = normalize_model(raw)
    assert result["pricing_input"] == 0.0
    assert result["pricing_output"] == 0.0


def test_sync_vector_search_index_calls_sdk():
    with patch("jobs.ingestion.ingest.WorkspaceClient") as mock_wc_cls:
        mock_wc = MagicMock()
        mock_wc_cls.return_value = mock_wc

        sync_vector_search_index("catalog.schema.my_index")

        mock_wc.vector_search_indexes.sync_index.assert_called_once_with(
            index_name="catalog.schema.my_index"
        )
