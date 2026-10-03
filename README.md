# KapilAI Interview Hub

Final stack: React + Vite, FastAPI, PostgreSQL, SQLAlchemy and Ollama.

## 1. PostgreSQL
Create database:
```sql
CREATE DATABASE kapilai;
```

## 2. Backend
```powershell
cd KapilAI\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
Edit `.env` and replace `YOUR_PASSWORD`.

Run:
```powershell
uvicorn app.main:app --reload
```
Swagger: http://127.0.0.1:8000/docs

## 3. Ollama
Install Ollama, then:
```powershell
ollama pull llama3.2:3b
ollama serve
```
Keep the backend `.env` as:
```env
OLLAMA_ENABLED=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

## 4. Frontend
Open a second terminal:
```powershell
cd KapilAI\frontend
npm install
npm run dev
```
Open http://localhost:5173

Browser title: KapilAI
