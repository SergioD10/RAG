const API_BASE_URL = 'http://localhost:8000/api/v1'

export interface QueryRequest {
  question: string
  provider: 'ollama' | 'gemini'
  top_k?: number
}

export interface QueryResponse {
  answer: string
  sources: Array<{
    text: string
    score: number
    metadata?: Record<string, any>
  }>
  provider: string
  processing_time: number
}

export interface DocumentUploadResponse {
  success: boolean
  document_id: string
  message: string
}

export interface StatsResponse {
  documents: number
  queries: number
  avg_response_time: number
  storage_used: number
  vector_store_status: 'healthy' | 'degraded' | 'offline'
  last_update: string
}

export async function queryRAG(request: QueryRequest): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Query failed: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadFile(file: File): Promise<DocumentUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  return response.json()
}

export async function uploadText(text: string, metadata: Record<string, any> = {}): Promise<DocumentUploadResponse> {
  const response = await fetch(`${API_BASE_URL}/documents/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      metadata: {
        ...metadata,
        uploaded_at: new Date().toISOString(),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Text upload failed: ${response.statusText}`)
  }

  return response.json()
}

export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_BASE_URL}/stats`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`)
  }

  return response.json()
}

export async function clearDocuments(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/documents/clear`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to clear documents: ${response.statusText}`)
  }

  return response.json()
}

export async function checkHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/health`)
  
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`)
  }

  return response.json()
}