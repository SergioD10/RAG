'use client'

import { useState } from 'react'
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    text: string
    score: number
    metadata?: Record<string, any>
  }>
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your RAG assistant. I can help you query documents in your knowledge base. Ask me anything!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [provider, setProvider] = useState<'ollama' | 'gemini'>('ollama')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/v1/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          provider,
          top_k: 4,
        }),
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'No response received',
        timestamp: new Date(),
        sources: data.sources || [],
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please check if the API server is running.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-cta/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-cta" />
              </div>
            )}
            
            <div className={`flex-1 ${message.role === 'user' ? 'order-first' : ''}`}>
              <div className={`rounded-lg p-4 ${message.role === 'user' ? 'bg-primary/30' : 'glass-card'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-text/70" />
                    ) : (
                      <Bot className="w-4 h-4 text-cta" />
                    )}
                    <span className="text-sm font-medium">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  <span className="text-xs text-text/50">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-text/90 whitespace-pre-wrap">{message.content}</p>
                
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm font-medium mb-2 text-text/70">Sources:</p>
                    <div className="space-y-2">
                      {message.sources.map((source, index) => (
                        <div
                          key={index}
                          className="text-sm bg-white/5 rounded p-2 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => copyToClipboard(source.text)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-text/50">Score: {source.score.toFixed(4)}</span>
                            <Copy className="w-3 h-3 text-text/50 hover:text-cta transition-colors" />
                          </div>
                          <p className="text-text/80 line-clamp-2">{source.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {message.role === 'assistant' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      className="text-xs flex items-center gap-1 text-text/50 hover:text-cta transition-colors"
                      onClick={() => copyToClipboard(message.content)}
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    <button className="text-xs flex items-center gap-1 text-text/50 hover:text-green-500 transition-colors">
                      <ThumbsUp className="w-3 h-3" /> Helpful
                    </button>
                    <button className="text-xs flex items-center gap-1 text-text/50 hover:text-red-500 transition-colors">
                      <ThumbsDown className="w-3 h-3" /> Not helpful
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-primary/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-text" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-cta/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-cta" />
            </div>
            <div className="glass-card rounded-lg p-4 flex-1">
              <div className="flex items-center gap-2">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-2 h-2 bg-cta rounded-full"></div>
                  <div className="w-2 h-2 bg-cta rounded-full"></div>
                  <div className="w-2 h-2 bg-cta rounded-full"></div>
                </div>
                <span className="text-sm text-text/70">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'ollama' | 'gemini')}
            className="glass-card rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
          >
            <option value="ollama">Ollama</option>
            <option value="gemini">Gemini</option>
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full glass-card rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cta/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cta text-background rounded-lg hover:bg-cta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}