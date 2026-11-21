"""Streams chat completions from NVIDIA NIM, grounded in retrieved chunk context."""

import asyncio
import json
import os
from collections.abc import AsyncGenerator

# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
# pyrefly: ignore [missing-import]
from openai import OpenAI

load_dotenv()

_NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
_MODEL = os.getenv("NVIDIA_MODEL", "meta/llama-3.2-11b-vision-instruct")

_client: OpenAI | None = None
if _NVIDIA_API_KEY:
    _client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=_NVIDIA_API_KEY
    )
def create_embeddings(
    texts: list[str],
    input_type: str = "passage"
) -> list[list[float]]:

    if not _client:
        raise RuntimeError(
            "NVIDIA_API_KEY is not configured."
        )

    if not texts:
        return []

    response = _client.embeddings.create(
        model="nvidia/nemotron-3.5-embed-1b",
        input=texts,
        extra_body={
            "input_type": input_type,
            "truncate": "END"
        }
    )

    results = sorted(
        response.data,
        key=lambda item: item.index
    )

    return [item.embedding for item in results]

def _build_system_prompt(retrieved_chunks: list[dict]) -> str:
    if not retrieved_chunks:
        context_block = "No relevant context was found in any uploaded source."
    else:
        context_parts = []
        for chunk in retrieved_chunks:
            context_parts.append(
                f"[Source: {chunk['source_title']} | Type: {chunk['source_type']}]\n"
                f"{chunk['chunk_text']}"
            )
        context_block = "\n\n---\n\n".join(context_parts)

    return (
        "You are NexusResearch, an advanced, highly articulate research assistant fluent in English and Hindi. "
        "You synthesize and explain information from the user's uploaded sources (PDFs, web pages, YouTube video transcripts).\n\n"
        "=== CRITICAL LANGUAGE RULES ===\n"
        "1. DEFAULT TO ENGLISH: You MUST ALWAYS respond in clear, professional ENGLISH by default for any English query (e.g. 'summarise', 'explain', 'what is this about?', etc.).\n"
        "2. CROSS-LINGUAL TRANSLATION: If the uploaded context, document, or video transcript is in Hindi (or Devanagari), but the user asks their question in English, you MUST translate and summarize the content completely into ENGLISH.\n"
        "3. HINDI ONLY WHEN REQUESTED: Respond in Hindi IF AND ONLY IF the user wrote their prompt in Hindi / Devanagari script (e.g. 'सारांश बताइए', 'यह क्या है?') or explicitly asked for Hindi (e.g. 'Explain in Hindi', 'Hindi me batao').\n"
        "4. The user's prompt language ALWAYS determines your response language. NEVER mirror the document's language if the user asked in English.\n\n"
        "=== ANSWERING & CITATION GUIDELINES ===\n"
        "5. Provide comprehensive, structured, and in-depth explanations with clean markdown (bullet points, bold key terms, section headers).\n"
        "6. Cite your sources inline using exact titles: [Source: <title>].\n"
        "7. Never invent facts. Base your answers strictly on the retrieved context below.\n\n"
        "=== RETRIEVED CONTEXT ===\n"
        f"{context_block}\n"
        "=== END RETRIEVED CONTEXT ==="
    )


def _run_nvidia_stream_sync(messages: list[dict]):
    """Blocking call to the OpenAI SDK — must be run in a thread executor."""
    assert _client is not None
    # pyrefly: ignore[no-matching-overload]
    return _client.chat.completions.create(
        model=_MODEL,
        messages=messages,
        stream=True,
    )


async def stream_chat_response(
    message: str,
    retrieved_chunks: list[dict],
    chat_history: list[dict],
) -> AsyncGenerator[str, None]:
    """Yield SSE-formatted tokens for an NVIDIA chat completion.

    The SDK call itself is synchronous, so it is executed in a thread
    executor via loop.run_in_executor — calling it directly here would block
    the FastAPI event loop for every other concurrent request.
    """
    if not _client:
        yield f"data: {json.dumps('[Error: NVIDIA_API_KEY is not set on the server.]')}\n\n"
        yield "data: [DONE]\n\n"
        return

    system_prompt = _build_system_prompt(retrieved_chunks)
    messages = [{"role": "system", "content": system_prompt}]
    for turn in chat_history:
        role = turn.get("role") if isinstance(turn, dict) else getattr(turn, "role", None)
        content = turn.get("content") if isinstance(turn, dict) else getattr(turn, "content", None)
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": message})

    loop = asyncio.get_event_loop()

    try:
        stream = await loop.run_in_executor(None, _run_nvidia_stream_sync, messages)
    except Exception as e:
        yield f"data: {json.dumps(f'[Error contacting NVIDIA API: {e}]')}\n\n"
        yield "data: [DONE]\n\n"
        return

    try:
        # Iterating the stream performs blocking network I/O on each
        # step, so each "next chunk" fetch also runs off the event loop.
        iterator = iter(stream)
        while True:
            try:
                chunk = await loop.run_in_executor(None, next, iterator, None)
            except StopIteration:
                break
            if chunk is None:
                break

            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                # JSON-encode the token so any character it contains
                # (including literal newlines, which a tokenizer can emit
                # as a single "\n\n" token for paragraph breaks) is safely
                # escaped and can never be mistaken for the "\n\n" frame
                # delimiter by the frontend's SSE parser. The frontend
                # JSON.parse()s this payload back into the raw token text.
                yield f"data: {json.dumps(delta)}\n\n"
    except Exception as e:
        yield f"data: {json.dumps(f'[Error during streaming: {e}]')}\n\n"
    finally:
        yield "data: [DONE]\n\n"
