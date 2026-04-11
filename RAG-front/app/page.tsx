"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/chat-interface";
import { DocumentUpload } from "@/components/document-upload";
import { SystemStatus } from "@/components/system-status";
import { MessageSquare, Upload, Settings } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Sistema RAG
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Consulta tus documentos con inteligencia artificial
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <DocumentUpload />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SystemStatus />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
