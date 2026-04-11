"""Configuración centralizada de variables de entorno"""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class EnvConfig:
    """Clase para gestionar todas las variables de entorno del sistema"""

    # Ollama Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_EMBEDDING_MODEL: str = os.getenv(
        "OLLAMA_EMBEDDING_MODEL", "nomic-embed-text"
    )
    OLLAMA_LLM_MODEL: str = os.getenv("OLLAMA_LLM_MODEL", "llama3.2")
    OLLAMA_TEMPERATURE: float = float(os.getenv("OLLAMA_TEMPERATURE", "0.7"))

    # Gemini Configuration
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-pro")
    GEMINI_TEMPERATURE: float = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))

    # Vector Store Configuration
    CHROMA_PERSIST_DIRECTORY: str = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "rag_documents")

    # Document Processing
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "200"))

    # Retrieval Configuration
    TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", "4"))
    SEARCH_TYPE: str = os.getenv("SEARCH_TYPE", "similarity")
    SCORE_THRESHOLD: float = float(os.getenv("SCORE_THRESHOLD", "0.7"))

    # LLM Provider
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "ollama")

    # API Configuration
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    API_RELOAD: bool = os.getenv("API_RELOAD", "false").lower() == "true"
    API_WORKERS: int = int(os.getenv("API_WORKERS", "1"))

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    @classmethod
    def validate(cls) -> bool:
        """Valida que las configuraciones críticas estén presentes"""
        if cls.DEFAULT_LLM_PROVIDER == "gemini" and not cls.GOOGLE_API_KEY:
            raise ValueError(
                "GOOGLE_API_KEY es requerido cuando DEFAULT_LLM_PROVIDER es 'gemini'"
            )
        return True

    @classmethod
    def get_config_dict(cls) -> dict:
        """Retorna todas las configuraciones como diccionario"""
        return {
            "ollama": {
                "base_url": cls.OLLAMA_BASE_URL,
                "embedding_model": cls.OLLAMA_EMBEDDING_MODEL,
                "llm_model": cls.OLLAMA_LLM_MODEL,
                "temperature": cls.OLLAMA_TEMPERATURE,
            },
            "gemini": {
                "model": cls.GEMINI_MODEL,
                "temperature": cls.GEMINI_TEMPERATURE,
                "api_key_set": bool(cls.GOOGLE_API_KEY),
            },
            "vectorstore": {
                "persist_directory": cls.CHROMA_PERSIST_DIRECTORY,
                "collection_name": cls.CHROMA_COLLECTION_NAME,
            },
            "document_processing": {
                "chunk_size": cls.CHUNK_SIZE,
                "chunk_overlap": cls.CHUNK_OVERLAP,
            },
            "retrieval": {
                "top_k": cls.TOP_K_RESULTS,
                "search_type": cls.SEARCH_TYPE,
                "score_threshold": cls.SCORE_THRESHOLD,
            },
            "llm": {"default_provider": cls.DEFAULT_LLM_PROVIDER},
            "api": {
                "host": cls.API_HOST,
                "port": cls.API_PORT,
                "reload": cls.API_RELOAD,
                "workers": cls.API_WORKERS,
            },
        }


# Instancia global
env_config = EnvConfig()

# Validar al importar
try:
    env_config.validate()
except ValueError as e:
    print(f"⚠️  Advertencia de configuración: {e}")
