"""Ejemplos de uso del cliente API"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"


def check_health():
    """Verificar estado del sistema"""
    response = requests.get(f"{BASE_URL}/health")
    print("Health Check:", response.json())


def query_rag(question: str, provider: str = "ollama"):
    """Hacer una consulta al RAG"""
    payload = {"question": question, "provider": provider, "top_k": 4}

    response = requests.post(f"{BASE_URL}/query", json=payload)
    result = response.json()

    print("\n" + "=" * 80)
    print("PREGUNTA:", question)
    print("PROVEEDOR:", result["provider"])
    print("=" * 80)
    print("\nRESPUESTA:")
    print(result["answer"])
    print("\nFUENTES:")
    for i, source in enumerate(result["sources"], 1):
        print(f"{i}. Score: {source['score']:.4f}")
        print(f"   {source['text'][:100]}...")


def add_text_document(text: str, metadata: dict = None):
    """Agregar documento de texto"""
    payload = {"text": text, "metadata": metadata or {"source": "api"}}

    response = requests.post(f"{BASE_URL}/documents/text", json=payload)
    print("Documento agregado:", response.json())


def upload_file(file_path: str):
    """Subir archivo"""
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(f"{BASE_URL}/documents/upload", files=files)

    print("Archivo subido:", response.json())


if __name__ == "__main__":
    # Ejemplos de uso
    print("Ejemplos de uso de la API RAG\n")

    # 1. Health check
    check_health()

    # 2. Agregar documento
    add_text_document(
        text="Python es un lenguaje de programación de alto nivel.",
        metadata={"topic": "programming", "language": "es"},
    )

    # 3. Consultar
    query_rag("¿Qué es Python?", provider="ollama")
