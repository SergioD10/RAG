"use client";

import { useState } from "react";

export default function SimpleHome() {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Sistema RAG - Test Simple</h1>
        <p className="text-gray-600 mb-8">
          Si ves esto, Next.js está funcionando correctamente.
        </p>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded">
            <h2 className="font-semibold mb-2">Test de Interactividad</h2>
            <p className="mb-2">Contador: {count}</p>
            <button
              onClick={() => setCount(count + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Incrementar
            </button>
          </div>

          <div className="p-4 bg-green-50 rounded">
            <h2 className="font-semibold mb-2">✅ Next.js está funcionando</h2>
            <p className="text-sm text-gray-600">
              Si ves este mensaje, el problema estaba en los componentes complejos.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded">
            <h2 className="font-semibold mb-2">Siguiente paso</h2>
            <p className="text-sm text-gray-600">
              Renombra page-backup.tsx a page.tsx para restaurar la interfaz completa.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
