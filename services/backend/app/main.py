from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from app.chat import stream_response

app = FastAPI(title="RAG Agent")


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/chat")
async def chat(request: ChatRequest) -> StreamingResponse:
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    return StreamingResponse(
        stream_response(messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


_static_dir = Path("frontend/dist")
if _static_dir.exists():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="static")
