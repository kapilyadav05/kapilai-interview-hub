from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class TopicCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str = ""
    icon: str = "📚"
class TopicOut(TopicCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class QuestionCreate(BaseModel):
    topic_id: int
    question: str = Field(min_length=1)
    answer: str = ""
    difficulty: str = "Medium"
    category: str = "Interview"
    tags: str = ""
class QuestionOut(QuestionCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AIGenerateRequest(BaseModel):
    count: int = Field(default=5, ge=1, le=20)
    difficulty: str = "Medium"
    category: str = "Interview"

class AIEvaluateRequest(BaseModel):
    question: str
    expected_answer: str
    user_answer: str
