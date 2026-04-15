import ChatInterface from '@/components/chat-interface'
import DocumentUpload from '@/components/document-upload'
import SystemStats from '@/components/system-stats'
import { FileText, MessageSquare, BarChart3, Upload } from 'lucide-react'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="font-fira-code text-3xl font-bold mb-2">Retrieval-Augmented Generation Dashboard</h1>
        <p className="text-text/70 font-fira-sans">
          Interact with your document knowledge base using AI-powered retrieval
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <FileText className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Documents</p>
              <p className="font-fira-code text-2xl font-bold">--</p>
            </div>
          </div>
          <p className="text-xs text-text/50">Total documents in vector store</p>
        </div>

        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Queries</p>
              <p className="font-fira-code text-2xl font-bold">--</p>
            </div>
          </div>
          <p className="text-xs text-text/50">Total queries processed</p>
        </div>

        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Avg Response Time</p>
              <p className="font-fira-code text-2xl font-bold">-- ms</p>
            </div>
          </div>
          <p className="text-xs text-text/50">Average query processing time</p>
        </div>

        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Upload className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Storage Used</p>
              <p className="font-fira-code text-2xl font-bold">-- MB</p>
            </div>
          </div>
          <p className="text-xs text-text/50">Vector store disk usage</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chat Interface */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-cta" />
              <h2 className="font-fira-code text-xl font-bold">Chat Interface</h2>
            </div>
            <ChatInterface />
          </div>
        </div>

        {/* Right Column - Tools */}
        <div className="space-y-6">
          {/* Document Upload */}
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-6 h-6 text-cta" />
              <h2 className="font-fira-code text-xl font-bold">Document Upload</h2>
            </div>
            <DocumentUpload />
          </div>

          {/* System Stats */}
          <div className="glass-card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-cta" />
              <h2 className="font-fira-code text-xl font-bold">System Statistics</h2>
            </div>
            <SystemStats />
          </div>
        </div>
      </div>
    </div>
  )
}