import json
import uuid
import asyncio

# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest
from services.nvidia_client import stream_chat_response, _client, _MODEL
from services.vector_store import vector_store
from services.db import add_message, update_project_name

router = APIRouter(prefix="/chat", tags=["chat"])

def _generate_title_sync(message: str) -> str:
    if not _client:
        return "New Project"
    try:
        resp = _client.chat.completions.create(
            model=_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful multilingual assistant. Generate a concise (1-4 words) project title "
                        "based on the user's initial query in the same language as the query (Hindi or English). "
                        "Only output the raw title text without quotes, formatting, or prefixes."
                    ),
                },
                {"role": "user", "content": message},
            ],
            max_tokens=15,
        )
        # pyrefly: ignore[missing-attribute]
        title = resp.choices[0].message.content.strip().strip('"').strip("'")
        return title if title else "New Project"
    except Exception:
        return "New Project"

@router.post("")
async def chat(request: ChatRequest) -> StreamingResponse:
    search_query = request.message
    
    # Extract the last user message from the history to provide context for follow-up questions
    user_messages = [m for m in request.chat_history if getattr(m, "role", m.get("role") if isinstance(m, dict) else None) == "user"]
    if user_messages:
        last_user_msg = getattr(user_messages[-1], "content", user_messages[-1].get("content") if isinstance(user_messages[-1], dict) else "")
        search_query = f"{last_user_msg}\n{request.message}"

    retrieved_chunks = vector_store.query(
    request.project_id,
    search_query,
    top_k=5
)

    citations = [
        {
            "source_id": chunk["source_id"],
            "source_title": chunk["source_title"],
            "source_type": chunk["source_type"],
            "chunk_text": chunk["chunk_text"],
        }
        for chunk in retrieved_chunks
    ]

    chat_history = [turn.model_dump() for turn in request.chat_history]

    # Save user message
    add_message(uuid.uuid4().hex, request.project_id, "user", request.message, [])

    if len(request.chat_history) == 0:
        # Background task to generate and update title
        loop = asyncio.get_event_loop()
        def background_title():
            title = _generate_title_sync(request.message)
            update_project_name(request.project_id, title)
        loop.run_in_executor(None, background_title)

    async def event_stream():
        yield f"data: __CITATIONS__{json.dumps(citations)}\n\n"
        
        full_content = ""
        async for token_event in stream_chat_response(
            message=request.message,
            retrieved_chunks=retrieved_chunks,
            chat_history=chat_history,
        ):
            if token_event.startswith("data: ") and not token_event.startswith("data: [DONE]"):
                payload = token_event[6:].strip()
                if payload and not payload.startswith("__CITATIONS__"):
                    try:
                        token = json.loads(payload)
                        full_content += token
                    except:
                        pass
            yield token_event
            
        # Save assistant message
        add_message(uuid.uuid4().hex, request.project_id, "assistant", full_content, citations)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
