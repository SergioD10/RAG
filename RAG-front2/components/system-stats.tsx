'use client'

import { useState, useEffect } from 'react'
import { Database, Cpu, HardDrive, Clock, RefreshCw, AlertCircle } from 'lucide-react'

interface SystemStats {
  documents: number
  queries: number
  avg_response_time: number
  storage_used: number
  vector_store_status: 'healthy' | 'degraded' | 'offline'
  last_update: string
}

export default function SystemStats() {
  const [stats, setStats] = useState<SystemStats>({
    documents: 0,
    queries: 0,
    avg_response_time: 0,
    storage_used: 0,
    vector_store_status: 'offline',
    last_update: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/stats')
      if (response.ok) {
        const data = await response.json()
        setStats({
          documents: data.documents || 0,
          queries: data.queries || 0,
          avg_response_time: data.avg_response_time || 0,
          storage_used: data.storage_used || 0,
          vector_store_status: data.vector_store_status || 'offline',
          last_update: data.last_update || new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setIsLoading(false)
      setLastRefreshed(new Date())
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'degraded': return 'text-yellow-500'
      case 'offline': return 'text-red-500'
      default: return 'text-text/70'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'degraded': return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      case 'offline': return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      default: return <AlertCircle className="w-3 h-3 text-text/70" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Database className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Documents</p>
              <p className="font-fira-code text-2xl font-bold">
                {isLoading ? '--' : stats.documents}
              </p>
            </div>
          </div>
          <p className="text-xs text-text/50">Total in vector store</p>
        </div>

        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Cpu className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Avg Response</p>
              <p className="font-fira-code text-2xl font-bold">
                {isLoading ? '--' : `${stats.avg_response_time}ms`}
              </p>
            </div>
          </div>
          <p className="text-xs text-text/50">Query processing time</p>
        </div>

        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <HardDrive className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Storage</p>
              <p className="font-fira-code text-2xl font-bold">
                {isLoading ? '--' : formatBytes(stats.storage_used)}
              </p>
            </div>
          </div>
          <p className="text-xs text-text/50">Vector store usage</p>
        </div>

        <div className="glass-card rounded-lg p-4 hover-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Clock className="w-5 h-5 text-cta" />
            </div>
            <div>
              <p className="text-sm text-text/70">Queries</p>
              <p className="font-fira-code text-2xl font-bold">
                {isLoading ? '--' : stats.queries}
              </p>
            </div>
          </div>
          <p className="text-xs text-text/50">Total processed</p>
        </div>
      </div>

      {/* Status & Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-fira-code font-medium">System Status</h3>
            <div className="flex items-center gap-2">
              {getStatusIcon(stats.vector_store_status)}
              <span className={`text-sm font-medium ${getStatusColor(stats.vector_store_status)}`}>
                {stats.vector_store_status.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 glass-card rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>

        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text/70">Last Updated</p>
              <p className="font-medium">
                {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text/70">API Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  stats.vector_store_status === 'healthy' ? 'bg-green-500 animate-pulse' :
                  stats.vector_store_status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm">
                  {stats.vector_store_status === 'healthy' ? 'Connected' :
                   stats.vector_store_status === 'degraded' ? 'Degraded' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => fetch('http://localhost:8000/api/v1/documents/clear', { method: 'DELETE' })}
            className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors font-medium text-sm"
          >
            Clear Documents
          </button>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-cta/20 text-cta rounded-lg hover:bg-cta/30 transition-colors font-medium text-sm"
          >
            Reindex Store
          </button>
        </div>
      </div>
    </div>
  )
}