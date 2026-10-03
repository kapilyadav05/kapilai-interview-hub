from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Question, Topic
from ..schemas import QuestionCreate, QuestionOut

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.get("", response_model=list[QuestionOut])
def list_questions(topic_id: int | None = None, search: str | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(Question)
    if topic_id: q = q.filter(Question.topic_id == topic_id)
    if search: q = q.filter(Question.question.ilike(f"%{search}%"))
    return q.order_by(Question.id.desc()).all()

@router.post("", response_model=QuestionOut, status_code=201)
def create_question(data: QuestionCreate, db: Session = Depends(get_db)):
    if not db.get(Topic, data.topic_id): raise HTTPException(404, "Topic not found")
    item = Question(**data.model_dump()); db.add(item); db.commit(); db.refresh(item)
    return item

@router.put("/{question_id}", response_model=QuestionOut)
def update_question(question_id: int, data: QuestionCreate, db: Session = Depends(get_db)):
    item = db.get(Question, question_id)
    if not item: raise HTTPException(404, "Question not found")
    if not db.get(Topic, data.topic_id): raise HTTPException(404, "Topic not found")
    for k,v in data.model_dump().items(): setattr(item,k,v)
    db.commit(); db.refresh(item); return item

@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    item = db.get(Question, question_id)
    if not item: raise HTTPException(404, "Question not found")
    db.delete(item); db.commit(); return {"message":"Question deleted"}
