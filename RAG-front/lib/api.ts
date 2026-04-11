const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type Module = "nutresa" | "corona" | "novaventa";

export interface QueryRequest {
  question: string;
  module: Module;
  provider?: "ollama" | "gemini";
  top_k?: number;
}

export interface Source {
  text: string;
  score: number;
  filename?: string;
  chunk_index?: number;
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  provider: string;
  module: string;
}

export interface DocumentResponse {
  status: string;
  message: string;
  module: string;
  chunks?: number;
}

export interface HealthResponse {
  status: string;
  message: string;
  version?: string;
}

// Helper para manejar errores de fetch
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Si no se puede parsear el JSON, usar el mensaje por defecto
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

// Helper para manejar errores de red
function handleNetworkError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    throw new Error(
      "No se puede conectar al servidor. Verifica que el backend esté ejecutándose en " + API_URL
    );
  }
  throw error;
}

export const api = {
  async query(data: QueryRequest): Promise<QueryResponse> {
    try {
      const response = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: "cors",
        body: JSON.stringify(data),
      });
      return handleResponse<QueryResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async addTextDocument(text: string, module: Module, metadata?: Record<string, any>): Promise<DocumentResponse> {
    try {
      const response = await fetch(`${API_URL}/documents/text`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({ text, module, metadata }),
      });
      return handleResponse<DocumentResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async uploadFile(file: File, module: Module): Promise<DocumentResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(`${API_URL}/documents/upload?module=${module}`, {
        method: "POST",
        mode: "cors",
        body: formData,
      });
      return handleResponse<DocumentResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async clearModuleDocuments(module: Module): Promise<{ status: string; message: string; module: string }> {
    try {
      const response = await fetch(`${API_URL}/documents/clear/${module}`, {
        method: "DELETE",
        mode: "cors",
      });
      return handleResponse<{ status: string; message: string; module: string }>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async clearAllDocuments(): Promise<{ status: string; message: string; results: Record<string, string> }> {
    try {
      const response = await fetch(`${API_URL}/documents/clear-all`, {
        method: "DELETE",
        mode: "cors",
      });
      return handleResponse<{ status: string; message: string; results: Record<string, string> }>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Accept": "application/json",
        },
      });
      return handleResponse<HealthResponse>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },

  async getModules(): Promise<{ modules: string[]; description: string }> {
    try {
      const response = await fetch(`${API_URL}/modules`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Accept": "application/json",
        },
      });
      return handleResponse<{ modules: string[]; description: string }>(response);
    } catch (error) {
      return handleNetworkError(error);
    }
  },
};
