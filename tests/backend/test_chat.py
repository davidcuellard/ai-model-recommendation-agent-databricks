import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from app.chat import build_context


def test_build_context_formats_model_info():
    chunks = [
        {
            "id": "anthropic/claude-haiku-4-5 ",
            "name": "Claude Sonnet",
            "description": "Powerful model for complex tasks",
            "context_length": 200000,
            "pricing_input": 0.000003,
            "pricing_output": 0.000015,
        }
    ]
    context = build_context(chunks)
    assert "anthropic/claude-haiku-4-5 " in context
    assert "200000" in context
    assert "3.0000" in context  # $3/1M input


def test_build_context_multiple_chunks_separated():
    chunks = [
        {
            "id": "a/model-1",
            "name": "M1",
            "description": "",
            "context_length": 4096,
            "pricing_input": 0.0,
            "pricing_output": 0.0,
        },
        {
            "id": "b/model-2",
            "name": "M2",
            "description": "",
            "context_length": 8192,
            "pricing_input": 0.0,
            "pricing_output": 0.0,
        },
    ]
    context = build_context(chunks)
    assert "a/model-1" in context
    assert "b/model-2" in context
    assert "---" in context  # separator between chunks


def test_build_context_empty_returns_fallback_message():
    context = build_context([])
    assert "No models retrieved" in context


@pytest.mark.asyncio
async def test_stream_response_yields_tokens_then_done():
    mock_chunk = MagicMock()
    mock_chunk.choices = [MagicMock()]
    mock_chunk.choices[0].delta.content = "Hello"

    async def fake_stream():
        yield mock_chunk

    with patch("app.chat._query_vector_search", return_value=[]):
        with patch("app.chat.openrouter_client") as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=fake_stream())

            from app.chat import stream_response

            events = []
            async for event in stream_response([{"role": "user", "content": "test"}]):
                events.append(event)

    data_events = [json.loads(e[6:]) for e in events if e.startswith("data: ")]
    assert any(d.get("token") == "Hello" for d in data_events)
    assert data_events[-1] == {"done": True}


@pytest.mark.asyncio
async def test_stream_response_skips_none_content():
    chunk_with_none = MagicMock()
    chunk_with_none.choices = [MagicMock()]
    chunk_with_none.choices[0].delta.content = None

    chunk_with_text = MagicMock()
    chunk_with_text.choices = [MagicMock()]
    chunk_with_text.choices[0].delta.content = "World"

    async def fake_stream():
        yield chunk_with_none
        yield chunk_with_text

    with patch("app.chat._query_vector_search", return_value=[]):
        with patch("app.chat.openrouter_client") as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=fake_stream())

            from app.chat import stream_response

            events = []
            async for event in stream_response([{"role": "user", "content": "test"}]):
                events.append(event)

    data_events = [json.loads(e[6:]) for e in events if e.startswith("data: ")]
    tokens = [d["token"] for d in data_events if "token" in d]
    assert tokens == ["World"]


def test_health_endpoint():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_chat_endpoint_returns_stream():
    from fastapi.testclient import TestClient

    async def fake_stream():
        chunk = MagicMock()
        chunk.choices = [MagicMock()]
        chunk.choices[0].delta.content = "Hi"
        yield chunk

    with patch("app.chat._query_vector_search", return_value=[]):
        with patch("app.chat.openrouter_client") as mock_client:
            mock_client.chat.completions.create = AsyncMock(return_value=fake_stream())

            from app.main import app

            client = TestClient(app)
            with client.stream(
                "POST", "/api/chat", json={"messages": [{"role": "user", "content": "test"}]}
            ) as resp:
                assert resp.status_code == 200
                assert "text/event-stream" in resp.headers["content-type"]
                content = resp.read().decode()
    assert "Hi" in content
    assert '"done": true' in content
