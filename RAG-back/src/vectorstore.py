from typing import List, Tuple, Optional
import os
import chromadb
from chromadb.config import Settings
from src.config import config
from src.embeddings import OllamaEmbeddings


class VectorStore:
    """
    VectorStore con soporte para múltiples colecciones aisladas.
    Cada módulo (Nutresa, Corona, Novaventa) tiene su propia colección.
    """

    # Módulos disponibles
    AVAILABLE_MODULES = ["nutresa", "corona", "novaventa"]

    def __init__(self, module: str = None, persist_directory: str = None):
        """
        Inicializa el VectorStore para un módulo específico.

        Args:
            module: Nombre del módulo (nutresa, corona, novaventa)
            persist_directory: Directorio de persistencia
        """
        # Validar módulo
        if module and module.lower() not in self.AVAILABLE_MODULES:
            raise ValueError(
                f"Módulo '{module}' no válido. Debe ser uno de: {', '.join(self.AVAILABLE_MODULES)}"
            )

        self.module = module.lower() if module else "general"
        self.collection_name = f"rag_{self.module}"

        self.persist_directory = (
            persist_directory
            or os.getenv("CHROMA_PERSIST_DIRECTORY")
            or config.get("vectorstore.persist_directory", "./chroma_db")
        )

        # Usar PersistentClient para guardar en disco
        self.client = chromadb.PersistentClient(
            path=self.persist_directory, settings=Settings(anonymized_telemetry=False)
        )

        self.embeddings = OllamaEmbeddings()
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine", "module": self.module},
        )

    def add_documents(
        self, texts: List[str], metadatas: List[dict] = None, ids: List[str] = None
    ):
        """Agrega documentos a la colección del módulo actual."""
        if not texts:
            return

        embeddings = self.embeddings.embed_documents(texts)

        if ids is None:
            # Generar IDs únicos por módulo
            existing_count = self.collection.count()
            ids = [f"{self.module}_doc_{existing_count + i}" for i in range(len(texts))]

        if metadatas is None:
            metadatas = [{"source": "unknown", "module": self.module} for _ in texts]
        else:
            # Asegurar que cada metadata tenga el módulo
            for metadata in metadatas:
                metadata["module"] = self.module

        self.collection.add(
            embeddings=embeddings, documents=texts, metadatas=metadatas, ids=ids
        )

    def similarity_search(
        self, query: str, top_k: int = 4, relevance_threshold: float = 0.7
    ) -> List[Tuple[str, float, dict]]:
        """
        Busca documentos similares SOLO en la colección del módulo actual.
        No accede a documentos de otros módulos.

        Args:
            query: Consulta de búsqueda
            top_k: Número máximo de resultados
            relevance_threshold: Umbral de relevancia (0-1). Solo retorna documentos
                               con distancia menor a este valor. Valores más bajos = más estricto.
                               Por defecto 0.7 filtra resultados poco relevantes.

        Returns:
            List of tuples (document_text, score, metadata)
        """
        query_embedding = self.embeddings.embed_query(query)

        results = self.collection.query(
            query_embeddings=[query_embedding], n_results=top_k
        )

        documents = results["documents"][0]
        distances = results["distances"][0]
        metadatas = (
            results["metadatas"][0]
            if results.get("metadatas")
            else [{}] * len(documents)
        )

        # Filtrar por umbral de relevancia (distancia coseno: menor = más similar)
        filtered_results = [
            (doc, dist, meta)
            for doc, dist, meta in zip(documents, distances, metadatas)
            if dist <= relevance_threshold
        ]

        return filtered_results

    def clear(self):
        """Elimina todos los documentos de la colección del módulo actual."""
        self.client.delete_collection(self.collection_name)
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine", "module": self.module},
        )

    @classmethod
    def list_modules(cls) -> List[str]:
        """Retorna la lista de módulos disponibles."""
        return cls.AVAILABLE_MODULES
