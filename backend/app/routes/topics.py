from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Topic
from ..schemas import TopicCreate, TopicOut

# ADDED
from ..auth.dependencies import require_admin

router = APIRouter(prefix="/api/topics", tags=["Topics"])

@router.get("", response_model=list[TopicOut])
def list_topics(db: Session = Depends(get_db)):
    return db.query(Topic).order_by(Topic.name).all()

@router.post("", response_model=TopicOut, status_code=201)
def create_topic(
    data: TopicCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)  # ADDED
):
    if db.query(Topic).filter(Topic.name.ilike(data.name)).first():
        raise HTTPException(409, "Topic already exists")
    item = Topic(**data.model_dump())
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.put("/{topic_id}", response_model=TopicOut)
def update_topic(
    topic_id: int,
    data: TopicCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)  # ADDED
):
    item = db.get(Topic, topic_id)
    if not item: raise HTTPException(404, "Topic not found")
    for k,v in data.model_dump().items(): setattr(item,k,v)
    db.commit(); db.refresh(item)
    return item

@router.delete("/{topic_id}")
def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)  # ADDED
):
    item = db.get(Topic, topic_id)
    if not item: raise HTTPException(404, "Topic not found")
    db.delete(item); db.commit()
    return {"message":"Topic deleted"}