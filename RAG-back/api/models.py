from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum


class ModuleEnum(str, Enum):
    """Módulos disponibles en el sistema RAG"""

    nutresa = "nutresa"
    corona = "corona"
    novaventa = "novaventa"


class QueryRequest(BaseModel):
    question: str = Field(..., description="Pregunta para el sistema RAG")
    module: ModuleEnum = Field(
        ..., description="Módulo a consultar: nutresa, corona o novaventa"
    )
    provider: Optional[str] = Field(
        None, description="Proveedor LLM: 'ollama' o 'gemini'"
    )
    top_k: Optional[int] = Field(4, description="Número de documentos a recuperar")

    class Config:
        json_schema_extra = {
            "example": {
                "question": "¿Cuál es el tema principal del documento?",
                "module": "nutresa",
                "provider": "ollama",
                "top_k": 4,
            }
        }


class Source(BaseModel):
    text: str
    score: float
    filename: Optional[str] = None
    chunk_index: Optional[int] = None


class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]
    provider: str
    module: str


class DocumentRequest(BaseModel):
    text: str = Field(..., description="Contenido del documento")
    module: ModuleEnum = Field(
        ..., description="Módulo al que pertenece: nutresa, corona o novaventa"
    )
    metadata: Optional[Dict] = Field(None, description="Metadatos adicionales")

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Este es el contenido del documento...",
                "module": "nutresa",
                "metadata": {"source": "manual", "author": "Usuario"},
            }
        }


class DocumentResponse(BaseModel):
    status: str
    message: str
    module: str
    chunks: Optional[int] = None


class HealthResponse(BaseModel):
    status: str
    message: str
    version: Optional[str] = "1.0.0"
