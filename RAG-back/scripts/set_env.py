#!/usr/bin/env python3
"""Script interactivo para configurar variables de entorno"""

import os
from pathlib import Path


def set_env():
    print("=" * 60)
    print("Configuración de Variables de Entorno")
    print("=" * 60)
    print("\nEste script te ayudará a configurar tu archivo .env\n")

    env_path = Path(".env")
    env_example_path = Path(".env.example")

    # Leer .env.example
    if not env_example_path.exists():
        print("✗ No se encontró .env.example")
        return

    with open(env_example_path, "r") as f:
        example_content = f.read()

    # Leer .env existente si existe
    existing_vars = {}
    if env_path.exists():
        print("✓ Archivo .env existente encontrado")
        response = input("¿Deseas sobrescribirlo? (s/n): ")
        if response.lower() != "s":
            print("Operación cancelada")
            return

        with open(env_path, "r") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    existing_vars[key] = value

    # Variables a configurar
    vars_to_set = {}

    print("\n" + "-" * 60)
    print("Configuración de Ollama")
    print("-" * 60)

    vars_to_set["OLLAMA_BASE_URL"] = input(
        f"URL de Ollama [{existing_vars.get('OLLAMA_BASE_URL', 'http://localhost:11434')}]: "
    ) or existing_vars.get("OLLAMA_BASE_URL", "http://localhost:11434")

    vars_to_set["OLLAMA_EMBEDDING_MODEL"] = input(
        f"Modelo de embeddings [{existing_vars.get('OLLAMA_EMBEDDING_MODEL', 'nomic-embed-text')}]: "
    ) or existing_vars.get("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")

    vars_to_set["OLLAMA_LLM_MODEL"] = input(
        f"Modelo LLM de Ollama [{existing_vars.get('OLLAMA_LLM_MODEL', 'llama3.2')}]: "
    ) or existing_vars.get("OLLAMA_LLM_MODEL", "llama3.2")

    print("\n" + "-" * 60)
    print("Configuración de Gemini (opcional)")
    print("-" * 60)

    use_gemini = input("¿Deseas usar Gemini? (s/n): ")
    if use_gemini.lower() == "s":
        vars_to_set["GOOGLE_API_KEY"] = input(
            f"API Key de Gemini [{existing_vars.get('GOOGLE_API_KEY', 'your_gemini_api_key_here')}]: "
        ) or existing_vars.get("GOOGLE_API_KEY", "your_gemini_api_key_here")

        vars_to_set["GEMINI_MODEL"] = input(
            f"Modelo de Gemini [{existing_vars.get('GEMINI_MODEL', 'gemini-pro')}]: "
        ) or existing_vars.get("GEMINI_MODEL", "gemini-pro")
    else:
        vars_to_set["GOOGLE_API_KEY"] = existing_vars.get(
            "GOOGLE_API_KEY", "your_gemini_api_key_here"
        )
        vars_to_set["GEMINI_MODEL"] = existing_vars.get("GEMINI_MODEL", "gemini-pro")

    print("\n" + "-" * 60)
    print("Configuración del Sistema")
    print("-" * 60)

    vars_to_set["DEFAULT_LLM_PROVIDER"] = input(
        f"Proveedor LLM por defecto (ollama/gemini) [{existing_vars.get('DEFAULT_LLM_PROVIDER', 'ollama')}]: "
    ) or existing_vars.get("DEFAULT_LLM_PROVIDER", "ollama")

    # Usar valores por defecto para el resto
    defaults = {
        "CHROMA_PERSIST_DIRECTORY": "./chroma_db",
        "CHROMA_COLLECTION_NAME": "rag_documents",
        "LANGFLOW_HOST": "127.0.0.1",
        "LANGFLOW_PORT": "7860",
        "CHUNK_SIZE": "1000",
        "CHUNK_OVERLAP": "200",
        "TOP_K_RESULTS": "4",
        "API_HOST": "0.0.0.0",
        "API_PORT": "8000",
        "API_WORKERS": "4",
        "API_RELOAD": "false",
    }

    for key, default_value in defaults.items():
        vars_to_set[key] = existing_vars.get(key, default_value)

    # Escribir .env
    with open(env_path, "w") as f:
        f.write("# Configuración del Sistema RAG\n")
        f.write("# Generado automáticamente\n\n")

        f.write("# Google Gemini API Key\n")
        f.write(f"GOOGLE_API_KEY={vars_to_set['GOOGLE_API_KEY']}\n")
        f.write(f"GEMINI_MODEL={vars_to_set['GEMINI_MODEL']}\n\n")

        f.write("# Ollama Configuration\n")
        f.write(f"OLLAMA_BASE_URL={vars_to_set['OLLAMA_BASE_URL']}\n")
        f.write(f"OLLAMA_EMBEDDING_MODEL={vars_to_set['OLLAMA_EMBEDDING_MODEL']}\n")
        f.write(f"OLLAMA_LLM_MODEL={vars_to_set['OLLAMA_LLM_MODEL']}\n\n")

        f.write("# LLM Provider\n")
        f.write(f"DEFAULT_LLM_PROVIDER={vars_to_set['DEFAULT_LLM_PROVIDER']}\n\n")

        f.write("# Vector Store\n")
        f.write(f"CHROMA_PERSIST_DIRECTORY={vars_to_set['CHROMA_PERSIST_DIRECTORY']}\n")
        f.write(f"CHROMA_COLLECTION_NAME={vars_to_set['CHROMA_COLLECTION_NAME']}\n\n")

        f.write("# Langflow\n")
        f.write(f"LANGFLOW_HOST={vars_to_set['LANGFLOW_HOST']}\n")
        f.write(f"LANGFLOW_PORT={vars_to_set['LANGFLOW_PORT']}\n\n")

        f.write("# RAG Configuration\n")
        f.write(f"CHUNK_SIZE={vars_to_set['CHUNK_SIZE']}\n")
        f.write(f"CHUNK_OVERLAP={vars_to_set['CHUNK_OVERLAP']}\n")
        f.write(f"TOP_K_RESULTS={vars_to_set['TOP_K_RESULTS']}\n\n")

        f.write("# API Configuration\n")
        f.write(f"API_HOST={vars_to_set['API_HOST']}\n")
        f.write(f"API_PORT={vars_to_set['API_PORT']}\n")
        f.write(f"API_WORKERS={vars_to_set['API_WORKERS']}\n")
        f.write(f"API_RELOAD={vars_to_set['API_RELOAD']}\n")

    print("\n" + "=" * 60)
    print("✓ Archivo .env creado exitosamente")
    print("=" * 60)
    print("\nPuedes editar .env manualmente si necesitas hacer cambios")
    print("Ejecuta 'python scripts/check_env.py' para verificar la configuración")


if __name__ == "__main__":
    set_env()
