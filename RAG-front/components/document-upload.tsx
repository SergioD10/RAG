"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Loader2, Trash2, Building2 } from "lucide-react";
import { api, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const MODULE_NAMES = {
  nutresa: "Nutresa",
  corona: "Corona",
  novaventa: "Novaventa",
};

export function DocumentUpload() {
  const [textContent, setTextContent] = useState("");
  const [textModule, setTextModule] = useState<Module>("nutresa");
  const [fileModule, setFileModule] = useState<Module>("nutresa");
  const [isUploadingText, setIsUploadingText] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clearModule, setClearModule] = useState<Module>("nutresa");
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const { toast } = useToast();

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    setIsUploadingText(true);
    try {
      const response = await api.addTextDocument(textContent, textModule);
      toast({
        title: "Éxito",
        description: response.message,
      });
      setTextContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error agregando documento",
        variant: "destructive",
      });
    } finally {
      setIsUploadingText(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploadingFile(true);
    try {
      const response = await api.uploadFile(selectedFile, fileModule);
      toast({
        title: "Éxito",
        description: `${response.message} (${response.chunks} chunks procesados)`,
      });
      setSelectedFile(null);
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error subiendo archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleClearModule = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar todos los documentos de ${MODULE_NAMES[clearModule]}?`)) return;

    setIsClearing(true);
    try {
      const response = await api.clearModuleDocuments(clearModule);
      toast({
        title: "Éxito",
        description: response.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error limpiando documentos",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar TODOS los documentos de TODOS los módulos? Esta acción es irreversible.")) return;

    setIsClearingAll(true);
    try {
      const response = await api.clearAllDocuments();
      toast({
        title: "Éxito",
        description: response.message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error limpiando documentos",
        variant: "destructive",
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Agregar Texto
          </CardTitle>
          <CardDescription>
            Escribe o pega texto directamente para agregarlo a un módulo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-module" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Módulo
              </Label>
              <Select value={textModule} onValueChange={(v) => setTextModule(v as Module)}>
                <SelectTrigger id="text-module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutresa">🏢 Nutresa</SelectItem>
                  <SelectItem value="corona">🏭 Corona</SelectItem>
                  <SelectItem value="novaventa">🏪 Novaventa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-content">Contenido del Documento</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Escribe o pega tu texto aquí..."
                className="min-h-[200px]"
              />
            </div>
            <Button type="submit" disabled={isUploadingText || !textContent.trim()} className="w-full">
              {isUploadingText ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Agregar a {MODULE_NAMES[textModule]}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Subir Archivo
          </CardTitle>
          <CardDescription>
            Sube archivos PDF, TXT, MD o DOCX a un módulo específico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-module" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Módulo
              </Label>
              <Select value={fileModule} onValueChange={(v) => setFileModule(v as Module)}>
                <SelectTrigger id="file-module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutresa">🏢 Nutresa</SelectItem>
                  <SelectItem value="corona">🏭 Corona</SelectItem>
                  <SelectItem value="novaventa">🏪 Novaventa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-upload">Seleccionar Archivo</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <Button type="submit" disabled={isUploadingFile || !selectedFile} className="w-full">
              {isUploadingFile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir a {MODULE_NAMES[fileModule]}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clear-module" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Limpiar Módulo
              </Label>
              <Select value={clearModule} onValueChange={(v) => setClearModule(v as Module)}>
                <SelectTrigger id="clear-module">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutresa">🏢 Nutresa</SelectItem>
                  <SelectItem value="corona">🏭 Corona</SelectItem>
                  <SelectItem value="novaventa">🏪 Novaventa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="destructive"
              onClick={handleClearModule}
              disabled={isClearing}
              className="w-full"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Limpiando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar {MODULE_NAMES[clearModule]}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isClearingAll}
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {isClearingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Limpiando Todo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar TODOS los Módulos
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Estas acciones son irreversibles
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
