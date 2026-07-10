import json
import os
from collections.abc import AsyncGenerator

from openai import AsyncOpenAI

from app.retrieval import query_vector_search as _query_vector_search

openrouter_client = AsyncOpenAI(
    api_key=os.environ.get("OPENROUTER_API_KEY", "placeholder"),
    base_url="https://openrouter.ai/api/v1",
)

OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "anthropic/claude-haiku-4-5")

SYSTEM_PROMPT = """\
You are an AI model recommendation agent grounded in live data from the OpenRouter catalog.

When a user describes what they want to build:
1. Decompose the request into 2-5 distinct subtasks.
2. For each subtask, recommend the most appropriate model from the context provided.
3. Explain your reasoning briefly and clearly.
4. End your response with EXACTLY this JSON block and nothing after it:

```json
{{
  "plan": [
    {{
      "subtask": "<subtask description>",
      "model": "<provider/model-id>",
      "provider": "<Provider Name via OpenRouter>",
      "reason": "<why this model fits this subtask>"
    }}
  ],
  "summary": "<one sentence overall summary>"
}}
```

Base all recommendations on the model context below. If the context is empty, use your \
training knowledge but explicitly note that you are not grounded in live catalog data.
{company_instruction}
Model context from OpenRouter catalog:
{context}
"""


def build_context(chunks: list[dict]) -> str:
    if not chunks:
        return "No models retrieved from catalog."
    parts = []
    for c in chunks:
        input_cost = float(c.get("pricing_input") or 0) * 1_000_000
        output_cost = float(c.get("pricing_output") or 0) * 1_000_000
        parts.append(
            f"Model: {c.get('id', '')}\n"
            f"Name: {c.get('name', '')}\n"
            f"Description: {str(c.get('description', ''))[:300]}\n"
            f"Context window: {c.get('context_length', 'unknown')} tokens\n"
            f"Input: ${input_cost:.4f}/1M tokens | Output: ${output_cost:.4f}/1M tokens"
        )
    return "\n\n---\n\n".join(parts)


async def stream_response(
    messages: list[dict], companies: list[str] | None = None
) -> AsyncGenerator[str, None]:
    user_query = messages[-1]["content"] if messages else ""
    chunks = _query_vector_search(user_query, companies=companies or None)
    context = build_context(chunks)
    if companies:
        company_list = ", ".join(companies)
        company_instruction = (
            f"\nIMPORTANT: The user has filtered to these providers only: {company_list}. "
            "Only recommend models from these providers.\n"
        )
    else:
        company_instruction = ""
    system_content = SYSTEM_PROMPT.format(context=context, company_instruction=company_instruction)

    api_messages = [{"role": "system", "content": system_content}] + messages

    stream = await openrouter_client.chat.completions.create(
        model=OPENROUTER_MODEL,
        messages=api_messages,
        stream=True,
    )
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content is not None:
            yield f"data: {json.dumps({'token': chunk.choices[0].delta.content})}\n\n"
    yield f"data: {json.dumps({'done': True})}\n\n"
