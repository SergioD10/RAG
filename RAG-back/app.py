#!/usr/bin/env python3
"""Aplicación principal del sistema RAG"""

import argparse
from src.rag_pipeline import RAGPipeline


def main():
    parser = argparse.ArgumentParser(description="Sistema RAG con Ollama y Gemini")
    parser.add_argument("question", help="Pregunta para el RAG")
    parser.add_argument(
        "--provider",
        choices=["ollama", "gemini"],
        help="Proveedor LLM (default: ollama)",
    )

    args = parser.parse_args()

    print("\n Sistema RAG iniciado")
    print(f"Proveedor: {args.provider or 'ollama (default)'}\n")

    pipeline = RAGPipeline()
    result = pipeline.query(args.question, provider=args.provider)

    print("=" * 80)
    print("RESPUESTA:")
    print("=" * 80)
    print(result["answer"])
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
