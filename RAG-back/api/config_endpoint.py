"""Endpoint para verificar configuración del sistema"""

from fastapi import APIRouter
from src.env_config import env_config

router = APIRouter()


@router.get("/config", tags=["Config"])
async def get_config():
    """
    Retorna la configuración actual del sistema (sin exponer secrets)
    """
    config_dict = env_config.get_config_dict()

    # Remover información sensible
    if "gemini" in config_dict:
        config_dict["gemini"].pop("api_key_set", None)

    return {"status": "ok", "config": config_dict}


@router.get("/config/validate", tags=["Config"])
async def validate_config():
    """
    Valida que la configuración sea correcta
    """
    try:
        env_config.validate()
        return {"status": "valid", "message": "Configuración válida"}
    except ValueError as e:
        return {"status": "invalid", "message": str(e)}
