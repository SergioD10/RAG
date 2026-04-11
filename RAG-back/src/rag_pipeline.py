from typing import List, Dict, Optional
import os
from src.vectorstore import VectorStore
from src.llm_providers import LLMSwitcher
from src.config import config


class RAGPipeline:
    """
    Pipeline RAG con soporte para múltiples módulos aislados.
    Cada módulo (Nutresa, Corona, Novaventa) tiene su propia base de datos.
    """

    def __init__(self, module: str = None, provider: str = None):
        """
        Inicializa el pipeline para un módulo específico.

        Args:
            module: Nombre del módulo (nutresa, corona, novaventa)
            provider: Proveedor LLM por defecto (ollama o gemini)
        """
        if module and module.lower() not in VectorStore.AVAILABLE_MODULES:
            raise ValueError(
                f"Módulo '{module}' no válido. Debe ser uno de: {', '.join(VectorStore.AVAILABLE_MODULES)}"
            )

        self.module = module.lower() if module else None
        self.vectorstore = VectorStore(module=self.module) if self.module else None
        self.llm_switcher = LLMSwitcher(default_provider=provider)
        self.top_k = int(os.getenv("TOP_K_RESULTS", "0")) or config.get(
            "retrieval.top_k", 4
        )
        # Umbral de relevancia: solo usa documentos con distancia <= 0.7
        # Valores más bajos = más estricto (solo documentos muy relevantes)
        self.relevance_threshold = float(os.getenv("RELEVANCE_THRESHOLD", "0.7"))

    def query(self, question: str, provider: str = None) -> Dict:
        """
        Realiza una consulta en el módulo actual.
        Si encuentra documentos relevantes, responde basándose en ellos.
        Si no encuentra documentos relevantes, responde con conocimiento general del LLM sin mostrar fuentes.
        """
        if not self.vectorstore:
            return {
                "answer": "Error: No se ha especificado un módulo para la consulta.",
                "sources": [],
                "provider": provider or self.llm_switcher.default_provider,
                "module": None,
            }

        # Recuperar documentos relevantes SOLO del módulo actual con umbral de relevancia
        results = self.vectorstore.similarity_search(
            question, top_k=self.top_k, relevance_threshold=self.relevance_threshold
        )

        # Si no hay documentos relevantes, responder con conocimiento general sin fuentes
        if not results:
            answer = self.llm_switcher.generate(
                prompt=question,
                context=None,  # Sin contexto, usa conocimiento general
                provider=provider,
            )
            return {
                "answer": answer,
                "sources": [],  # Sin fuentes cuando no hay documentos relevantes
                "provider": provider or self.llm_switcher.default_provider,
                "module": self.module,
            }

        # Si hay documentos relevantes, construir contexto y mostrar fuentes
        context = "\n\n".join([doc for doc, _, _ in results])

        # Generar respuesta usando el contexto
        answer = self.llm_switcher.generate(
            prompt=question, context=context, provider=provider
        )

        return {
            "answer": answer,
            "sources": [
                {
                    "text": doc[:200],
                    "score": float(score),
                    "filename": metadata.get("filename", "Desconocido"),
                    "chunk_index": metadata.get("chunk_index", 0),
                }
                for doc, score, metadata in results
            ],
            "provider": provider or self.llm_switcher.default_provider,
            "module": self.module,
        }

    def add_documents(self, texts: List[str], metadatas: List[dict] = None):
        """Agrega documentos al módulo actual."""
        if not self.vectorstore:
            raise ValueError("No se ha especificado un módulo para agregar documentos.")

        self.vectorstore.add_documents(texts, metadatas)

    @classmethod
    def get_available_modules(cls) -> List[str]:
        """Retorna la lista de módulos disponibles."""
        return VectorStore.AVAILABLE_MODULES
