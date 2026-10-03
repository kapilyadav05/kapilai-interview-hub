from fastapi import APIRouter, HTTPException
from ..schemas import AIGenerateRequest, AIEvaluateRequest
from ..services.ollama_service import ollama

router = APIRouter(prefix="/api/ai", tags=["AI / Ollama"])

@router.post("/generate/{topic_name}")
async def generate_questions(topic_name: str, data: AIGenerateRequest):
    prompt = f"Generate exactly {data.count} {data.difficulty} {data.category} interview questions for {topic_name}. Return numbered questions only, one per line."
    try: return {"topic": topic_name, "content": await ollama(prompt)}
    except Exception as e: raise HTTPException(503, f"Ollama unavailable: {e}")

@router.post("/evaluate")
async def evaluate(data: AIEvaluateRequest):
    prompt = f"Evaluate this interview answer. Give score out of 10, strengths, missing points, and concise improvement advice.\nQuestion: {data.question}\nExpected: {data.expected_answer}\nUser answer: {data.user_answer}"
    try: return {"content": await ollama(prompt)}
    except Exception as e: raise HTTPException(503, f"Ollama unavailable: {e}")
