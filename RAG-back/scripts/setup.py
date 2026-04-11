#!/usr/bin/env python3
"""Script de configuración inicial del proyecto RAG"""

import os
import subprocess
import sys
from pathlib import Path


def check_ollama():
    """Verifica si Ollama está instalado y corriendo"""
    try:
        result = subprocess.run(["ollama", "list"], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False


def pull_ollama_models():
    """Descarga los modelos necesarios de Ollama"""
    models = ["nomic-embed-text", "llama3.2"]

    for model in models:
        print(f"Descargando modelo {model}...")
        subprocess.run(["ollama", "pull", model])


def create_env_file():
    """Crea el archivo .env si no existe"""
    if not Path(".env").exists():
        print("Creando archivo .env...")
        response = input("¿Deseas configurar las variables de entorno ahora? (s/n): ")
        if response.lower() == "s":
            subprocess.run([sys.executable, "scripts/set_env.py"])
        else:
            import shutil

            shutil.copy(".env.example", ".env")
            print("✓ Archivo .env creado desde .env.example")
            print("  Edita .env y configura tus valores")
    else:
        print("✓ Archivo .env ya existe")


def main():
    print("=" * 60)
    print("Setup del Sistema RAG con Ollama y Gemini")
    print("=" * 60)

    # Verificar Ollama
    print("\n1. Verificando Ollama...")
    if check_ollama():
        print("✓ Ollama está instalado y corriendo")

        response = input("\n¿Descargar modelos de Ollama? (s/n): ")
        if response.lower() == "s":
            pull_ollama_models()
    else:
        print("✗ Ollama no está instalado o no está corriendo")
        print("  Instala Ollama desde: https://ollama.ai")
        sys.exit(1)

    # Crear archivo .env
    print("\n2. Configurando variables de entorno...")
    create_env_file()

    # Crear directorios necesarios
    print("\n3. Creando directorios...")
    Path("chroma_db").mkdir(exist_ok=True)
    print("✓ Directorios creados")

    print("\n" + "=" * 60)
    print("Setup completado!")
    print("=" * 60)
    print("\nPróximos pasos:")
    print("1. Verifica tu configuración: python scripts/check_env.py")
    print("2. Inicia la API: python scripts/start_api.py")
    print("3. Sube documentos desde el frontend (http://localhost:3000)")
    print("4. Consulta: python scripts/query_rag.py 'tu pregunta'")


if __name__ == "__main__":
    main()
