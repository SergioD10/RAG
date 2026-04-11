#!/usr/bin/env python3
"""Script para iniciar la API de FastAPI"""

import os
import sys
import uvicorn
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Agregar el directorio raíz al PYTHONPATH
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

load_dotenv()


def main():
    parser = argparse.ArgumentParser(description="Iniciar API del sistema RAG")
    parser.add_argument("--host", default=os.getenv("API_HOST", "0.0.0.0"), help="Host")
    parser.add_argument(
        "--port", type=int, default=int(os.getenv("API_PORT", "8000")), help="Puerto"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=os.getenv("API_RELOAD", "false").lower() == "true",
        help="Auto-reload en desarrollo",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=int(os.getenv("API_WORKERS", "1")),
        help="Número de workers",
    )

    args = parser.parse_args()

    print("=" * 60)
    print("🚀 Iniciando RAG API")
    print("=" * 60)
    print(f"Host: {args.host}")
    print(f"Port: {args.port}")
    print(f"Workers: {args.workers}")
    print(f"Reload: {args.reload}")
    print(f"Docs: http://{args.host}:{args.port}/docs")
    print(f"LLM Provider: {os.getenv('DEFAULT_LLM_PROVIDER', 'ollama')}")
    print("=" * 60)

    uvicorn.run(
        "api.app:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=1 if args.reload else args.workers,
    )


if __name__ == "__main__":
    main()
