from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, SessionLocal
from .models import Topic, Question
from .routes import topics, questions, ai, auth


app = FastAPI(
    title="KapilAI API",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://kapilai-interview-hub.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Database Tables
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# Seed Initial Topics
# --------------------------------------------------

@app.on_event("startup")
def seed():
    db = SessionLocal()

    try:
        if db.query(Topic).count() == 0:

            names = [
                (
                    "Python",
                    "Python programming and interview preparation",
                    "🐍"
                ),
                (
                    "NumPy",
                    "Numerical computing",
                    "🔢"
                ),
                (
                    "Pandas",
                    "Data analysis",
                    "🐼"
                ),
                (
                    "SQL",
                    "SQL and databases",
                    "🗄️"
                ),
                (
                    "Machine Learning",
                    "ML concepts and algorithms",
                    "🤖"
                ),
                (
                    "Deep Learning",
                    "Neural networks and DL",
                    "🧠"
                ),
                (
                    "TensorFlow",
                    "TensorFlow interview preparation",
                    "🔥"
                ),
                (
                    "PyTorch",
                    "PyTorch and deep learning",
                    "⚡"
                ),
                (
                    "Hugging Face",
                    "Transformers and models",
                    "🤗"
                ),
                (
                    "Generative AI",
                    "GenAI and LLMs",
                    "✨"
                ),
                (
                    "RAG",
                    "Retrieval Augmented Generation",
                    "📚"
                ),
                (
                    "LangChain",
                    "LangChain applications",
                    "🔗"
                ),
                (
                    "LlamaIndex",
                    "LlamaIndex and data frameworks",
                    "🦙"
                ),
                (
                    "Qdrant",
                    "Vector database and semantic search",
                    "🔎"
                ),
                (
                    "FastAPI",
                    "FastAPI backend development",
                    "🚀"
                ),
                (
                    "Django",
                    "Django development",
                    "🎯"
                ),
                (
                    "PostgreSQL",
                    "PostgreSQL database",
                    "🐘"
                ),
            ]

            for name, description, icon in names:
                db.add(
                    Topic(
                        name=name,
                        description=description,
                        icon=icon
                    )
                )

            db.commit()

    finally:
        db.close()


# --------------------------------------------------
# API Routes
# --------------------------------------------------

app.include_router(topics.router)
app.include_router(questions.router)
app.include_router(ai.router)
app.include_router(auth.router)


# --------------------------------------------------
# Root API
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "app": "KapilAI",
        "message": "KapilAI Interview Hub API is running"
    }