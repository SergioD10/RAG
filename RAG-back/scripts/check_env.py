#!/usr/bin/env python3
"""Script para verificar la configuración de variables de entorno"""

import os
from pathlib import Path
from dotenv import load_dotenv


def check_env():
    """Verifica que todas las variables de entorno necesarias estén configuradas"""

    # Cargar .env
    env_path = Path(".env")
    if not env_path.exists():
        print("❌ Archivo .env no encontrado")
        print("   Copia .env.example a .env y configura tus valores")
        return False

    load_dotenv()

    print("=" * 60)
    print("Verificación de Variables de Entorno")
    print("=" * 60)

    # Variables críticas
    critical_vars = {
        "OLLAMA_BASE_URL": os.getenv("OLLAMA_BASE_URL"),
        "OLLAMA_EMBEDDING_MODEL": os.getenv("OLLAMA_EMBEDDING_MODEL"),
        "OLLAMA_LLM_MODEL": os.getenv("OLLAMA_LLM_MODEL"),
    }

    # Variables opcionales
    optional_vars = {
        "GOOGLE_API_KEY": os.getenv("GOOGLE_API_KEY"),
        "CHROMA_PERSIST_DIRECTORY": os.getenv("CHROMA_PERSIST_DIRECTORY"),
        "CHUNK_SIZE": os.getenv("CHUNK_SIZE"),
        "TOP_K_RESULTS": os.getenv("TOP_K_RESULTS"),
        "DEFAULT_LLM_PROVIDER": os.getenv("DEFAULT_LLM_PROVIDER"),
    }

    print("\n✅ Variables Críticas:")
    all_critical_ok = True
    for var, value in critical_vars.items():
        status = "✓" if value else "✗"
        print(f"  {status} {var}: {value or 'NO CONFIGURADA'}")
        if not value:
            all_critical_ok = False

    print("\n📋 Variables Opcionales:")
    for var, value in optional_vars.items():
        status = "✓" if value else "○"
        display_value = (
            value if var != "GOOGLE_API_KEY" else ("***" if value else "NO CONFIGURADA")
        )
        print(f"  {status} {var}: {display_value}")

    # Advertencias
    print("\n⚠️  Advertencias:")
    provider = os.getenv("DEFAULT_LLM_PROVIDER", "ollama")
    if provider == "gemini" and not os.getenv("GOOGLE_API_KEY"):
        print(
            "  - DEFAULT_LLM_PROVIDER es 'gemini' pero GOOGLE_API_KEY no está configurada"
        )

    if not os.getenv("GOOGLE_API_KEY"):
        print("  - GOOGLE_API_KEY no configurada. Solo podrás usar Ollama como LLM")

    print("\n" + "=" * 60)

    if all_critical_ok:
        print("✅ Configuración básica completa")
        return True
    else:
        print("❌ Faltan variables críticas")
        return False


if __name__ == "__main__":
    check_env()
