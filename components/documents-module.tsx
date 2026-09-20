'use client'

import { useState, useEffect, useRef } from 'react'
import { getDocuments, addDocument, deleteDocument } from '@/app/actions/dashboard'
import { Upload, FileText, Trash2, Camera } from 'lucide-react'

export function DocumentsModule({ t }: { t: any }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  async function loadDocuments() {
    try {
      const data = await getDocuments()
      setDocuments(data)
    } catch (error) {
      console.error('[v0] Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(file: File) {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'No se pudo subir el archivo')
      const { pathname, size, contentType } = payload
      await addDocument(file.name, pathname, contentType, size)
      setError('')
      await loadDocuments()
    } catch (error) {
      console.error('[v0] Error uploading document:', error)
      setError(error instanceof Error ? error.message : 'No se pudo guardar el documento')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(docId: string) {
    try {
      await deleteDocument(docId)
      await loadDocuments()
    } catch (error) {
      console.error('[v0] Error deleting document:', error)
    }
  }

  if (loading) return <div className="text-center py-8 text-slate-500">Cargando documentos...</div>

  return (
    <div className="flex flex-col gap-6">
      <input 
        ref={fileInputRef} 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
        className="hidden" 
        accept="application/pdf,image/*"
      />
      <input 
        ref={cameraInputRef} 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
        className="hidden" 
        accept="image/*"
        capture="environment"
      />

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="rounded-2xl border border-dashed border-[#9ddbd6] bg-[#effaf9] p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white text-[#16aaa2] shadow-sm"><FileText /></div>
        <h2 className="mt-4 text-lg font-bold">Subir Documento</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Captura tickets con la cámara de tu móvil o sube PDFs de facturas y estados de cuenta.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row justify-center">
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="rounded-xl bg-[#12243d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Upload className="inline size-4 mr-2" />Subir Archivo</button>
          <button onClick={() => cameraInputRef.current?.click()} disabled={uploading} className="rounded-xl border border-[#16aaa2] px-4 py-2.5 text-sm font-semibold text-[#16aaa2] disabled:opacity-50"><Camera className="inline size-4 mr-2" />Usar Cámara</button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5eaf0] bg-white p-5">
        <h3 className="font-bold mb-4">Documentos Recientes</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-[#9ddbd6] hover:bg-[#f7fcfc]">
              <div className="flex size-10 items-center justify-center rounded-lg bg-rose-50 text-rose-500"><FileText className="size-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{doc.name}</p>
                <p className="text-[11px] text-slate-400">{(doc.size / 1024).toFixed(1)} KB · {new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
              <a href={`/api/file?pathname=${encodeURIComponent(doc.pathname)}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#16aaa2] hover:underline">Ver</a>
              <button onClick={() => handleDelete(doc.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
