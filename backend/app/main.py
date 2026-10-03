from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from .models import Topic, Question
from .routes import topics, questions, ai

app = FastAPI(title="KapilAI API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def seed():
    db=SessionLocal()
    if db.query(Topic).count()==0:
        names=[("Python","Python programming and interview preparation","🐍"),("NumPy","Numerical computing","🔢"),("Pandas","Data analysis","🐼"),("SQL","SQL and databases","🗄️"),("Machine Learning","ML concepts and algorithms","🤖"),("Deep Learning","Neural networks and DL","🧠"),("TensorFlow","TensorFlow interview preparation","🔥"),("PyTorch","PyTorch and deep learning","⚡"),("Hugging Face","Transformers and models","🤗"),("Generative AI","GenAI and LLMs","✨"),("RAG","Retrieval Augmented Generation","📚"),("LangChain","LangChain applications","🔗"),("LlamaIndex","LlamaIndex and data frameworks","🦙"),("Qdrant","Vector database and semantic search","🔎"),("FastAPI","FastAPI backend development","🚀"),("Django","Django development","🎯"),("PostgreSQL","PostgreSQL database","🐘")]
        for n,d,i in names: db.add(Topic(name=n,description=d,icon=i))
        db.commit()
    db.close()

app.include_router(topics.router); app.include_router(questions.router); app.include_router(ai.router)

@app.get("/")
def root(): return {"app":"KapilAI","message":"KapilAI Interview Hub API is running"}
