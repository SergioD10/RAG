"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Database, Building2 } from "lucide-react";
import { api, type HealthResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const MODULE_NAMES = {
  nutresa: "Nutresa",
  corona: "Corona",
  novaventa: "Novaventa",
};

const MODULE_ICONS = {
  nutresa: "🏢",
  corona: "🏭",
  novaventa: "🏪",
};

export function SystemStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkHealth = async (showToast = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const healthResponse = await api.healthCheck();
      setHealth(healthResponse);
      if (showToast) {
        toast({
          title: "Estado del Sistema",
          description: healthResponse.message,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error verificando estado";
      setError(errorMessage);
      if (showToast) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth(false);
  }, []);

  const isHealthy = health?.status === "healthy";

  return (
    <div className="grid gap-6">
      {/* Estado General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>
            Información sobre el estado del backend RAG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              {error ? (
                <XCircle className="w-8 h-8 text-destructive" />
              ) : isHealthy ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <Activity className="w-8 h-8 text-yellow-500 animate-pulse" />
              )}
              <div>
                <p className="font-semibold">
                  {error ? "Desconectado" : isHealthy ? "Operativo" : "Verificando..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {error ? error : health?.message || "Conectando al servidor..."}
                </p>
              </div>
            </div>
          </div>

          {health && (
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Versión</span>
                <span className="text-sm text-muted-foreground">{health.version || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Estado</span>
                <span className="text-sm text-muted-foreground capitalize">{health.status}</span>
              </div>
            </div>
          )}

          <Button onClick={() => checkHealth(true)} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Estado
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Módulos Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Módulos Disponibles
          </CardTitle>
          <CardDescription>
            Módulos independientes del sistema RAG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(MODULE_NAMES).map(([key, name]) => (
              <div key={key} className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <span className="text-3xl">{MODULE_ICONS[key as keyof typeof MODULE_ICONS]}</span>
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Configuración
          </CardTitle>
          <CardDescription>
            Información sobre la configuración del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Database className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Base de Datos Vectorial</p>
                <p className="text-xs text-muted-foreground mt-1">
                  ChromaDB con colecciones aisladas por módulo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Server className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Proveedores LLM</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ollama (local) y Gemini (cloud) disponibles
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Módulos Independientes</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nutresa, Corona y Novaventa con bases de datos aisladas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Activity className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-sm">Formatos Soportados</p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, TXT, MD, DOCX
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium mb-2">API Endpoint</p>
            <code className="text-xs bg-background px-2 py-1 rounded block break-all">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
