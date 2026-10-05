from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Question, Topic
from ..schemas import QuestionCreate, QuestionOut

# ADDED
from ..auth.dependencies import require_admin


router = APIRouter(
    prefix="/api/questions",
    tags=["Questions"]
)


# Get all questions
@router.get("", response_model=list[QuestionOut])
def list_questions(
    topic_id: int | None = None,
    search: str | None = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Question)

    if topic_id:
        q = q.filter(Question.topic_id == topic_id)

    if search:
        q = q.filter(
            Question.question.ilike(f"%{search}%")
        )

    return q.order_by(Question.id.desc()).all()


# Get questions by topic
@router.get("/topic/{topic_id}", response_model=list[QuestionOut])
def get_questions_by_topic(
    topic_id: int,
    db: Session = Depends(get_db)
):
    # Check topic exists
    topic = db.get(Topic, topic_id)

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    questions = (
        db.query(Question)
        .filter(Question.topic_id == topic_id)
        .order_by(Question.id.desc())
        .all()
    )

    return questions


# Create question
@router.post("", response_model=QuestionOut, status_code=201)
def create_question(
    data: QuestionCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)  # ADDED
):
    if not db.get(Topic, data.topic_id):
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    item = Question(**data.model_dump())

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


# Update question
@router.put("/{question_id}", response_model=QuestionOut)
def update_question(
    question_id: int,
    data: QuestionCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)  # ADDED
):
    item = db.get(Question, question_id)

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    if not db.get(Topic, data.topic_id):
        raise HTTPException(
            status_code=404,
            detail="Topic not found"
        )

    for key, value in data.model_dump().items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)

    return item


# Delete question
@router.delete("/{question_id}")
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)  # ADDED
):
    item = db.get(Question, question_id)

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    db.delete(item)
    db.commit()

    return {
        "message": "Question deleted"
    }