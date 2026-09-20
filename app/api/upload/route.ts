import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    const allowed = file.type === 'application/pdf' || file.type.startsWith('image/')
    if (!allowed || file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'Solo se permiten PDF o imágenes de hasta 15 MB' }, { status: 400 })
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
    const blob = await put(`documents/${Date.now()}-${safeName}`, file, {
      access: 'private',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      pathname: blob.pathname,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
