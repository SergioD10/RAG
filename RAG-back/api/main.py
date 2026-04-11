from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from src.rag_pipeline import RAGPipeline
from src.document_processor import DocumentProcessor
from src.vectorstore import VectorStore

app = FastAPI(
    title="RAG API",
    description="API para sistema RAG con Ollama y Gemini",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelos Pydantic
class QueryRequest(BaseModel):
    question: str
    provider: Optional[str] = None
    top_k: Optional[int] = 4


class QueryResponse(BaseModel):
    answer: str
    sources: List[dict]
    provider: str


class DocumentRequest(BaseModel):
    text: str
    metadata: Optional[dict] = None


class HealthResponse(BaseModel):
    status: str
    message: str


# Inicializar pipeline
pipeline = RAGPipeline()


@app.get("/", response_model=HealthResponse)
async def root():
    return {"status": "ok", "message": "RAG API está funcionando"}


@app.get("/health", response_model=HealthResponse)
async def health():
    return {"status": "healthy", "message": "Sistema operativo"}


@app.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    try:
        result = pipeline.query(question=request.question, provider=request.provider)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/documents/add")
async def add_document(request: DocumentRequest):
    try:
        pipeline.add_documents(
            texts=[request.text],
            metadatas=[request.metadata] if request.metadata else None,
        )
        return {"status": "success", "message": "Documento agregado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        processor = DocumentProcessor()

        # Guardar archivo temporalmente
        import tempfile

        with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Procesar documento
        chunks = processor.load_file(tmp_path)
        texts = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        pipeline.add_documents(texts, metadatas)

        return {
            "status": "success",
            "message": f"Archivo {file.filename} procesado",
            "chunks": len(chunks),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
