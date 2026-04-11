"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Send, Bot, User, Loader2, Building2 } from "lucide-react";
import { api, type QueryResponse, type Module } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: QueryResponse["sources"];
  module?: string;
}

const MODULE_NAMES = {
  nutresa: "Nutresa",
  corona: "Corona",
  novaventa: "Novaventa",
};

const MODULE_COLORS = {
  nutresa: "bg-blue-500",
  corona: "bg-green-500",
  novaventa: "bg-purple-500",
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [module, setModule] = useState<Module>("nutresa");
  const [provider, setProvider] = useState<"ollama" | "gemini">("ollama");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input, module };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.query({
        question: input,
        module,
        provider,
        top_k: 4,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
        module: response.module,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar la consulta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full h-[calc(100vh-16rem)]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Chat con tus Documentos
          </CardTitle>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label htmlFor="module" className="text-sm whitespace-nowrap">Módulo:</Label>
              <Select value={module} onValueChange={(v) => setModule(v as Module)}>
                <SelectTrigger id="module" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutresa">🏢 Nutresa</SelectItem>
                  <SelectItem value="corona">🏭 Corona</SelectItem>
                  <SelectItem value="novaventa">🏪 Novaventa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="provider" className="text-sm whitespace-nowrap">LLM:</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as "ollama" | "gemini")}>
                <SelectTrigger id="provider" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ollama">Ollama</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">¡Hola! Soy tu asistente RAG</p>
              <p className="text-sm">Selecciona un módulo y pregúntame sobre sus documentos</p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Nutresa</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">Corona</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Novaventa</span>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full ${MODULE_COLORS[message.module as Module] || "bg-primary"} flex items-center justify-center flex-shrink-0`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.module && message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                    <Building2 className="w-3 h-3" />
                    <span className="text-xs font-semibold opacity-70">
                      {MODULE_NAMES[message.module as Module]}
                    </span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-semibold mb-2 opacity-70">Fuentes:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs opacity-80 bg-background/50 p-2 rounded">
                          {source.filename && (
                            <p className="font-semibold text-primary mb-1">
                              📄 {source.filename}
                              {source.chunk_index !== undefined && ` (Parte ${source.chunk_index + 1})`}
                            </p>
                          )}
                          <p className="line-clamp-2">{source.text}</p>
                          <p className="text-[10px] mt-1 opacity-60">
                            Relevancia: {(source.score * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 rounded-full ${MODULE_COLORS[module]} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Pregunta sobre ${MODULE_NAMES[module]}...`}
              className="min-h-[60px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-[60px] w-[60px]">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Consultando en: <span className="font-semibold">{MODULE_NAMES[module]}</span> • Enter para enviar, Shift+Enter para nueva línea
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
