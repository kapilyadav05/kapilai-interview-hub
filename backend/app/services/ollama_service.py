import httpx
from ..config import settings

async def ollama(prompt: str) -> str:
    if not settings.ollama_enabled:
        raise RuntimeError("Ollama is disabled")
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(f"{settings.ollama_url}/api/generate", json={"model": settings.ollama_model, "prompt": prompt, "stream": False})
        r.raise_for_status()
        return r.json().get("response", "")
