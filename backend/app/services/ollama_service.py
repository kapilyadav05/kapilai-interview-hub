import httpx
from ..config import settings


async def ollama(prompt: str) -> str:
    if not settings.gemini_api_key:
        raise RuntimeError("Gemini API key is not configured")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-3.5-flash-lite:generateContent"
    )

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.gemini_api_key,
    }

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            url,
            headers=headers,
            json=payload,
        )

        response.raise_for_status()

        data = response.json()

        candidates = data.get("candidates", [])

        if not candidates:
            raise RuntimeError("Gemini returned no response")

        parts = candidates[0].get("content", {}).get("parts", [])

        if not parts:
            raise RuntimeError("Gemini returned empty content")

        return parts[0].get("text", "")