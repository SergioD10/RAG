from typing import List, Dict
from pathlib import Path
import os
from pypdf import PdfReader
from docx import Document
from src.config import config


class DocumentProcessor:
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = (
            chunk_size
            or int(os.getenv("CHUNK_SIZE", "0"))
            or config.get("document_processing.chunk_size", 1000)
        )
        self.chunk_overlap = (
            chunk_overlap
            or int(os.getenv("CHUNK_OVERLAP", "0"))
            or config.get("document_processing.chunk_overlap", 200)
        )

    def load_file(self, file_path: str, original_filename: str = None) -> List[Dict]:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Archivo no encontrado: {file_path}")

        # Usar el nombre original si se proporciona, sino usar el nombre del archivo
        filename = original_filename if original_filename else path.name

        if path.suffix == ".pdf":
            return self._load_pdf(path, filename)
        elif path.suffix == ".txt":
            return self._load_txt(path, filename)
        elif path.suffix == ".md":
            return self._load_txt(path, filename)
        elif path.suffix == ".docx":
            return self._load_docx(path, filename)
        else:
            raise ValueError(f"Formato no soportado: {path.suffix}")

    def _load_pdf(self, path: Path, filename: str) -> List[Dict]:
        chunks = []
        with open(path, "rb") as file:
            pdf_reader = PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()

            chunks = self._split_text(text, str(path), filename)
        return chunks

    def _load_txt(self, path: Path, filename: str) -> List[Dict]:
        with open(path, "r", encoding="utf-8") as file:
            text = file.read()
        return self._split_text(text, str(path), filename)

    def _load_docx(self, path: Path, filename: str) -> List[Dict]:
        doc = Document(path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return self._split_text(text, str(path), filename)

    def _split_text(self, text: str, source: str, filename: str) -> List[Dict]:
        """
        Divide el texto en chunks inteligentes para documentación técnica.
        Mantiene endpoints completos sin cortar en medio de bloques JSON.
        """
        chunks = []
        lines = text.split("\n")
        current_chunk = ""
        current_chunk_index = 0
        brace_count = 0

        # Marcadores de inicio de endpoint
        endpoint_markers = [
            "Method: GET",
            "Method: POST",
            "Method: PUT",
            "Method: DELETE",
            "Method: PATCH",
        ]

        for i, line in enumerate(lines):
            # Contar llaves para saber si estamos en un bloque JSON
            brace_count += line.count("{") - line.count("}")
            in_json = brace_count > 0

            # Detectar inicio de nuevo endpoint
            is_new_endpoint = any(marker in line for marker in endpoint_markers)

            # Agregar línea al chunk actual
            current_chunk += line + "\n"

            # Decidir si cortar el chunk
            should_cut = False

            # Caso 1: Encontramos un nuevo endpoint y el chunk actual tiene buen tamaño
            if is_new_endpoint and len(current_chunk) > 800 and not in_json:
                # Guardar el chunk anterior (sin la línea actual)
                prev_chunk = current_chunk[: -len(line) - 1].strip()
                if prev_chunk:
                    chunks.append(
                        {
                            "text": prev_chunk,
                            "metadata": {
                                "source": source,
                                "filename": filename,
                                "chunk_index": current_chunk_index,
                            },
                        }
                    )
                    current_chunk_index += 1
                    current_chunk = line + "\n"

            # Caso 2: El chunk es muy grande y estamos en una línea vacía fuera de JSON
            elif (
                len(current_chunk) > self.chunk_size
                and line.strip() == ""
                and not in_json
            ):
                chunks.append(
                    {
                        "text": current_chunk.strip(),
                        "metadata": {
                            "source": source,
                            "filename": filename,
                            "chunk_index": current_chunk_index,
                        },
                    }
                )
                current_chunk_index += 1
                current_chunk = ""

        # Agregar el último chunk
        if current_chunk.strip():
            chunks.append(
                {
                    "text": current_chunk.strip(),
                    "metadata": {
                        "source": source,
                        "filename": filename,
                        "chunk_index": current_chunk_index,
                    },
                }
            )

        # Si no hay chunks, crear uno con todo el texto
        if not chunks:
            chunks.append(
                {
                    "text": text.strip(),
                    "metadata": {
                        "source": source,
                        "filename": filename,
                        "chunk_index": 0,
                    },
                }
            )

        return chunks
