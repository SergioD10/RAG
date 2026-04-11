from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import tempfile
import os

from api.models import (
    QueryRequest,
    QueryResponse,
    DocumentRequest,
    DocumentResponse,
    HealthResponse,
    ModuleEnum,
)
from src.rag_pipeline import RAGPipeline
from src.document_processor import DocumentProcessor
from src.vectorstore import VectorStore
from src.config import config

router = APIRouter()


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Verifica el estado del sistema"""
    return {"status": "healthy", "message": "Sistema RAG operativo", "version": "1.0.0"}


@router.get("/modules", tags=["Modules"])
async def list_modules():
    """Lista todos los módulos disponibles"""
    return {
        "modules": RAGPipeline.get_available_modules(),
        "description": "Módulos independientes del sistema RAG",
    }


@router.post("/query", response_model=QueryResponse, tags=["RAG"])
async def query_documents(request: QueryRequest):
    """
    Realiza una consulta al sistema RAG en un módulo específico

    - **question**: Pregunta a realizar
    - **module**: Módulo a consultar (nutresa, corona, novaventa)
    - **provider**: 'ollama' (local) o 'gemini' (cloud)
    - **top_k**: Número de documentos relevantes a recuperar

    IMPORTANTE: Cada módulo tiene su propia base de datos aislada.
    La consulta SOLO buscará información en el módulo especificado.
    """
    try:
        pipeline = RAGPipeline(module=request.module.value)
        result = pipeline.query(question=request.question, provider=request.provider)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en consulta: {str(e)}")


@router.post("/documents/text", response_model=DocumentResponse, tags=["Documents"])
async def add_text_document(request: DocumentRequest):
    """
    Agrega un documento de texto directamente a un módulo específico

    - **text**: Contenido del documento
    - **module**: Módulo al que pertenece (nutresa, corona, novaventa)
    - **metadata**: Metadatos opcionales
    """
    try:
        pipeline = RAGPipeline(module=request.module.value)
        pipeline.add_documents(
            texts=[request.text],
            metadatas=[request.metadata] if request.metadata else None,
        )
        return {
            "status": "success",
            "message": f"Documento agregado exitosamente a {request.module.value.upper()}",
            "module": request.module.value,
            "chunks": 1,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error agregando documento: {str(e)}"
        )


@router.post("/documents/upload", response_model=DocumentResponse, tags=["Documents"])
async def upload_file(file: UploadFile = File(...), module: ModuleEnum = None):
    """
    Sube y procesa un archivo (PDF, TXT, MD, DOCX) a un módulo específico

    - **file**: Archivo a procesar
    - **module**: Módulo al que pertenece (nutresa, corona, novaventa) - query parameter

    El archivo se procesa automáticamente en chunks y se agrega al vectorstore del módulo.

    Ejemplo: POST /documents/upload?module=nutresa
    """
    if not module:
        raise HTTPException(
            status_code=400,
            detail="Debe especificar el módulo (nutresa, corona o novaventa) como query parameter",
        )

    try:
        processor = DocumentProcessor()

        # Validar extensión
        allowed_extensions = [".pdf", ".txt", ".md", ".docx"]
        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado. Use: {', '.join(allowed_extensions)}",
            )

        # Guardar temporalmente
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        try:
            # Procesar con el nombre original del archivo
            chunks = processor.load_file(tmp_path, original_filename=file.filename)
            texts = [chunk["text"] for chunk in chunks]
            metadatas = [chunk["metadata"] for chunk in chunks]

            # Agregar módulo a los metadatos
            for metadata in metadatas:
                metadata["module"] = module.value

            pipeline = RAGPipeline(module=module.value)
            pipeline.add_documents(texts, metadatas)

            return {
                "status": "success",
                "message": f"Archivo '{file.filename}' procesado exitosamente en {module.value.upper()}",
                "module": module.value,
                "chunks": len(chunks),
            }
        finally:
            # Limpiar archivo temporal
            os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error procesando archivo: {str(e)}"
        )


@router.delete("/documents/clear/{module}", tags=["Documents"])
async def clear_module_documents(module: ModuleEnum):
    """
    Elimina todos los documentos de un módulo específico

    - **module**: Módulo a limpiar (nutresa, corona, novaventa)

    ADVERTENCIA: Esta acción es irreversible y solo afecta al módulo especificado.
    """
    try:
        vectorstore = VectorStore(module=module.value)
        vectorstore.clear()
        return {
            "status": "success",
            "message": f"Todos los documentos de {module.value.upper()} han sido eliminados",
            "module": module.value,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error limpiando documentos: {str(e)}"
        )


@router.delete("/documents/clear-all", tags=["Documents"])
async def clear_all_documents():
    """
    Elimina todos los documentos de TODOS los módulos

    ADVERTENCIA: Esta acción es irreversible y afecta a todos los módulos.
    """
    try:
        results = {}
        for module in RAGPipeline.get_available_modules():
            try:
                vectorstore = VectorStore(module=module)
                vectorstore.clear()
                results[module] = "success"
            except Exception as e:
                results[module] = f"error: {str(e)}"

        return {
            "status": "success",
            "message": "Todos los documentos de todos los módulos han sido eliminados",
            "results": results,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error limpiando documentos: {str(e)}"
        )
