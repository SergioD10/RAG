from typing import Optional
import os
import requests
import google.generativeai as genai
from src.config import config


class OllamaLLM:
    def __init__(
        self, model: str = None, base_url: str = None, temperature: float = None
    ):
        self.model = (
            model
            or os.getenv("OLLAMA_LLM_MODEL")
            or config.get("llm.ollama.model", "llama3.2")
        )
        self.base_url = (
            base_url
            or os.getenv("OLLAMA_BASE_URL")
            or config.get("llm.ollama.base_url", "http://localhost:11434")
        )
        self.temperature = (
            temperature
            if temperature is not None
            else float(os.getenv("OLLAMA_TEMPERATURE", "0.7"))
        )

    def generate(self, prompt: str, context: Optional[str] = None) -> str:
        url = f"{self.base_url}/api/generate"

        full_prompt = prompt
        if context:
            full_prompt = f"Contexto:\n{context}\n\nPregunta: {prompt}\n\nRespuesta:"

        payload = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "options": {"temperature": self.temperature},
        }

        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            return response.json()["response"]
        except Exception as e:
            raise Exception(f"Error en Ollama LLM: {str(e)}")
        except Exception as e:
            raise Exception(f"Error en Ollama LLM: {str(e)}")


class GeminiLLM:
    def __init__(
        self, model: str = None, api_key: str = None, temperature: float = None
    ):
        self.model = (
            model
            or os.getenv("GEMINI_MODEL")
            or config.get("llm.gemini.model", "gemini-pro")
        )
        self.api_key = (
            api_key or os.getenv("GOOGLE_API_KEY") or config.get("llm.gemini.api_key")
        )
        self.temperature = (
            temperature
            if temperature is not None
            else float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        )

        if not self.api_key:
            raise ValueError(
                "API key de Gemini no configurada. Define GOOGLE_API_KEY en .env"
            )

        genai.configure(api_key=self.api_key)
        self.client = genai.GenerativeModel(self.model)

    def generate(self, prompt: str, context: Optional[str] = None) -> str:
        full_prompt = prompt
        if context:
            full_prompt = f"Contexto:\n{context}\n\nPregunta: {prompt}\n\nRespuesta:"

        try:
            response = self.client.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=self.temperature
                ),
            )
            return response.text
        except Exception as e:
            raise Exception(f"Error en Gemini LLM: {str(e)}")


class LLMSwitcher:
    def __init__(self, default_provider: str = None):
        self.default_provider = (
            default_provider
            or os.getenv("DEFAULT_LLM_PROVIDER")
            or config.get("llm.default_provider", "ollama")
        )
        self.ollama = None
        self.gemini = None

    def get_llm(self, provider: str = None):
        provider = provider or self.default_provider

        if provider == "ollama":
            if not self.ollama:
                self.ollama = OllamaLLM()
            return self.ollama
        elif provider == "gemini":
            if not self.gemini:
                self.gemini = GeminiLLM()
            return self.gemini
        else:
            raise ValueError(f"Proveedor desconocido: {provider}")

    def generate(
        self, prompt: str, context: Optional[str] = None, provider: str = None
    ) -> str:
        llm = self.get_llm(provider)
        return llm.generate(prompt, context)
