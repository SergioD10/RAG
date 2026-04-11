# API REST para Sistema RAG

API construida con FastAPI para interactuar con el sistema RAG.

## Iniciar la API

```bash
# Método 1: Usando el script
python scripts/start_api.py

# Método 2: Directamente con uvicorn
uvicorn api.app:app --reload --host 0.0.0.0 --port 8000

# Método 3: Con el módulo
python -m api.app
```

La API estará disponible en: http://localhost:8000

## Documentación Interactiva

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Endpoints Disponibles

### Health Check
```bash
GET /api/v1/health
```

### Consultar RAG
```bash
POST /api/v1/query
Content-Type: application/json

{
  "question": "¿Cuál es el tema principal?",
  "provider": "ollama",
  "top_k": 4
}
```

### Agregar Documento de Texto
```bash
POST /api/v1/documents/text
Content-Type: application/json

{
  "text": "Contenido del documento...",
  "metadata": {"source": "manual"}
}
```

### Subir Archivo
```bash
POST /api/v1/documents/upload
Content-Type: multipart/form-data

file: [archivo.pdf]
```

### Obtener Estadísticas
```bash
GET /api/v1/stats
```

### Limpiar Documentos
```bash
DELETE /api/v1/documents/clear
```

## Ejemplos con cURL

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Consulta con Ollama
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué es Python?", "provider": "ollama"}'

# Consulta con Gemini
curl -X POST http://localhost:8000/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué es Python?", "provider": "gemini"}'

# Subir archivo
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -F "file=@documento.pdf"

# Estadísticas
curl http://localhost:8000/api/v1/stats
```

## Ejemplos con Python

Ver `api/client_example.py` para ejemplos completos.

```python
import requests

# Consultar
response = requests.post(
    "http://localhost:8000/api/v1/query",
    json={"question": "¿Qué es Python?", "provider": "ollama"}
)
print(response.json())
```

## Configuración

La API usa variables de entorno definidas en el archivo `.env`:
- `OLLAMA_BASE_URL`: URL del servidor Ollama
- `OLLAMA_LLM_MODEL`: Modelo LLM a usar
- `GOOGLE_API_KEY`: API key de Google Gemini
- `CHROMA_PERSIST_DIRECTORY`: Directorio de ChromaDB
- `TOP_K_RESULTS`: Número de documentos a recuperar
- `RELEVANCE_THRESHOLD`: Umbral de relevancia

## Deployment

### Desarrollo
```bash
python scripts/start_api.py --reload
```

### Producción
```bash
uvicorn api.app:app --host 0.0.0.0 --port 8000 --workers 4
```
