from typing import List
import os
import requests
from src.config import config


class OllamaEmbeddings:
    def __init__(self, model: str = None, base_url: str = None):
        self.model = (
            model
            or os.getenv("OLLAMA_EMBEDDING_MODEL")
            or config.get("embeddings.model", "nomic-embed-text")
        )
        self.base_url = (
            base_url
            or os.getenv("OLLAMA_BASE_URL")
            or config.get("llm.ollama.base_url", "http://localhost:11434")
        )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in texts:
            embedding = self._get_embedding(text)
            embeddings.append(embedding)
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        return self._get_embedding(text)

    def _get_embedding(self, text: str) -> List[float]:
        url = f"{self.base_url}/api/embeddings"
        payload = {"model": self.model, "prompt": text}

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()["embedding"]
        except Exception as e:
            raise Exception(f"Error obteniendo embedding: {str(e)}")
