'use client'

import { useState } from 'react'
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react'

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error'
  message?: string
  filename?: string
}

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' })
  const [metadata, setMetadata] = useState({
    source: 'web',
    language: 'en',
    category: 'general',
  })

  const handleFileUpload = async () => {
    if (!file) return

    setUploadStatus({ status: 'uploading', filename: file.name })

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        setUploadStatus({
          status: 'success',
          message: 'Document uploaded successfully',
          filename: file.name,
        })
        setFile(null)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: 'Failed to upload document. Check if API server is running.',
        filename: file.name,
      })
    }
  }

  const handleTextUpload = async () => {
    if (!textInput.trim()) return

    setUploadStatus({ status: 'uploading', message: 'Uploading text...' })

    try {
      const response = await fetch('http://localhost:8000/api/v1/documents/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textInput,
          metadata: {
            ...metadata,
            uploaded_at: new Date().toISOString(),
          },
        }),
      })

      if (response.ok) {
        setUploadStatus({
          status: 'success',
          message: 'Text uploaded successfully',
        })
        setTextInput('')
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      setUploadStatus({
        status: 'error',
        message: 'Failed to upload text. Check if API server is running.',
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus({ status: 'idle' })
    }
  }

  const clearFile = () => {
    setFile(null)
    setUploadStatus({ status: 'idle' })
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="space-y-4">
        <h3 className="font-fira-code font-medium">Upload File</h3>
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="w-5 h-5 text-cta" />
              </div>
              <div>
                <p className="font-medium">Supported formats: PDF, TXT, DOCX</p>
                <p className="text-sm text-text/50">Max file size: 10MB</p>
              </div>
            </div>
            <label className="cursor-pointer">
              <div className="px-4 py-2 bg-cta text-background rounded-lg hover:bg-cta/90 transition-colors font-medium">
                Browse Files
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.docx"
              />
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-text/70" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-text/50">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text/70" />
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={uploadStatus.status === 'uploading'}
                  className="px-4 py-2 bg-cta text-background rounded-lg hover:bg-cta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {uploadStatus.status === 'uploading' ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Input */}
      <div className="space-y-4">
        <h3 className="font-fira-code font-medium">Add Text Document</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Source</label>
              <select
                value={metadata.source}
                onChange={(e) => setMetadata({ ...metadata, source: e.target.value })}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
              >
                <option value="web">Web</option>
                <option value="manual">Manual</option>
                <option value="api">API</option>
                <option value="file">File</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={metadata.language}
                onChange={(e) => setMetadata({ ...metadata, language: e.target.value })}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={metadata.category}
                onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                className="w-full glass-card rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cta/50"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="academic">Academic</option>
                <option value="legal">Legal</option>
              </select>
            </div>
          </div>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste or type your document content here..."
            className="w-full glass-card rounded-lg px-4 py-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-cta/50"
            rows={4}
          />

          <button
            onClick={handleTextUpload}
            disabled={!textInput.trim() || uploadStatus.status === 'uploading'}
            className="w-full px-4 py-3 bg-cta text-background rounded-lg hover:bg-cta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {uploadStatus.status === 'uploading' ? 'Uploading...' : 'Upload Text Document'}
          </button>
        </div>
      </div>

      {/* Status Display */}
      {uploadStatus.status !== 'idle' && (
        <div className={`rounded-lg p-4 ${
          uploadStatus.status === 'success' ? 'bg-green-500/10 border border-green-500/20' :
          uploadStatus.status === 'error' ? 'bg-red-500/10 border border-red-500/20' :
          'bg-blue-500/10 border border-blue-500/20'
        }`}>
          <div className="flex items-center gap-3">
            {uploadStatus.status === 'success' && <Check className="w-5 h-5 text-green-500" />}
            {uploadStatus.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {uploadStatus.status === 'uploading' && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            )}
            <div>
              <p className="font-medium">
                {uploadStatus.status === 'success' && 'Upload Successful'}
                {uploadStatus.status === 'error' && 'Upload Failed'}
                {uploadStatus.status === 'uploading' && 'Uploading...'}
              </p>
              <p className="text-sm text-text/70">
                {uploadStatus.message}
                {uploadStatus.filename && ` - ${uploadStatus.filename}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}