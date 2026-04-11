import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración del sistema basada en variables de entorno"""

    def __init__(self):
        self.config = self._load_config()

    def _load_config(self) -> dict:
        """Carga configuración desde variables de entorno"""
        return {
            "llm": {
                "default_provider": os.getenv("DEFAULT_LLM_PROVIDER", "ollama"),
                "ollama": {
                    "base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                    "model": os.getenv("OLLAMA_LLM_MODEL", "llama3.2"),
                    "temperature": float(os.getenv("OLLAMA_TEMPERATURE", "0.7")),
                },
                "gemini": {
                    "model": os.getenv("GEMINI_MODEL", "gemini-pro"),
                    "temperature": float(os.getenv("GEMINI_TEMPERATURE", "0.7")),
                    "api_key": os.getenv("GOOGLE_API_KEY", ""),
                },
            },
            "embeddings": {
                "provider": "ollama",
                "model": os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text"),
            },
            "vectorstore": {
                "type": "chromadb",
                "persist_directory": os.getenv(
                    "CHROMA_PERSIST_DIRECTORY", "./chroma_db"
                ),
                "collection_name": os.getenv("CHROMA_COLLECTION_NAME", "rag_documents"),
            },
            "document_processing": {
                "chunk_size": int(os.getenv("CHUNK_SIZE", "1000")),
                "chunk_overlap": int(os.getenv("CHUNK_OVERLAP", "200")),
            },
            "retrieval": {
                "top_k": int(os.getenv("TOP_K_RESULTS", "4")),
                "search_type": os.getenv("SEARCH_TYPE", "similarity"),
                "score_threshold": float(os.getenv("SCORE_THRESHOLD", "0.7")),
            },
        }

    def get(self, key: str, default=None):
        """
        Obtiene un valor de configuración usando notación de punto

        Ejemplo: config.get('llm.ollama.model')
        """
        keys = key.split(".")
        value = self.config
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
            else:
                return default
        return value if value is not None else default


# Instancia global de configuración
config = Config()
