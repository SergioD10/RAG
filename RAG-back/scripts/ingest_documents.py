import argparse
import sys
from pathlib import Path

# Agregar el directorio raíz al PYTHONPATH
root_dir = Path(__file__).parent.parent
sys.path.insert(0, str(root_dir))

from src.document_processor import DocumentProcessor
from src.vectorstore import VectorStore


def ingest_documents(data_path: str, clear_existing: bool = False):
    processor = DocumentProcessor()
    vectorstore = VectorStore()

    if clear_existing:
        print("Limpiando base de datos existente...")
        vectorstore.clear()

    data_dir = Path(data_path)
    if not data_dir.exists():
        print(f"Error: El directorio {data_path} no existe")
        return

    files = list(data_dir.glob("**/*"))
    supported_extensions = [".pdf", ".txt", ".md", ".docx"]
    files = [f for f in files if f.suffix in supported_extensions]

    if not files:
        print(f"No se encontraron archivos soportados en {data_path}")
        return

    print(f"Procesando {len(files)} archivos...")

    for file in files:
        try:
            print(f"Procesando: {file.name}")
            chunks = processor.load_file(str(file))

            texts = [chunk["text"] for chunk in chunks]
            metadatas = [chunk["metadata"] for chunk in chunks]
            ids = [f"{file.stem}_{i}" for i in range(len(chunks))]

            vectorstore.add_documents(texts, metadatas, ids)
            print(f"  ✓ {len(chunks)} chunks agregados")

        except Exception as e:
            print(f"  ✗ Error procesando {file.name}: {str(e)}")

    print("\n✓ Ingesta completada")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingerir documentos al RAG")
    parser.add_argument("--path", default="./data", help="Ruta a los documentos")
    parser.add_argument(
        "--clear", action="store_true", help="Limpiar base de datos existente"
    )

    args = parser.parse_args()
    ingest_documents(args.path, args.clear)
