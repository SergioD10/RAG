import argparse
import json
import sys
from pathlib import Path

# Agregar el directorio raíz al PYTHONPATH
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from src.rag_pipeline import RAGPipeline


def query_rag(question: str, provider: str = None):
    pipeline = RAGPipeline()

    print(f"\nPregunta: {question}")
    print(f"Proveedor: {provider or 'default (ollama)'}\n")
    print("Buscando información relevante...")

    result = pipeline.query(question, provider=provider)

    print("\n" + "=" * 80)
    print("RESPUESTA:")
    print("=" * 80)
    print(result["answer"])

    print("\n" + "=" * 80)
    print("FUENTES:")
    print("=" * 80)
    for i, source in enumerate(result["sources"], 1):
        print(f"\n{i}. Score: {source['score']:.4f}")
        print(f"   {source['text']}...")

    print(f"\n\nProveedor usado: {result['provider']}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Consultar el sistema RAG")
    parser.add_argument("question", help="Pregunta a realizar")
    parser.add_argument(
        "--provider", choices=["ollama", "gemini"], help="Proveedor LLM"
    )

    args = parser.parse_args()
    query_rag(args.question, args.provider)
