from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from api.config_endpoint import router as config_router
import uvicorn


def create_app() -> FastAPI:
    app = FastAPI(
        title="RAG API - Ollama & Gemini",
        description="API REST para sistema RAG con embeddings locales (Ollama) y LLM dual (Ollama/Gemini)",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS - Configuración para desarrollo
    origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",  # Permitir todos en desarrollo
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

    # Incluir rutas
    app.include_router(router, prefix="/api/v1")
    app.include_router(config_router, prefix="/api/v1")

    @app.get("/")
    async def root():
        return {
            "message": "RAG API con Ollama y Gemini",
            "docs": "/docs",
            "health": "/api/v1/health",
        }

    return app


app = create_app()

if __name__ == "__main__":
    uvicorn.run("api.app:app", host="0.0.0.0", port=8000, reload=True)
