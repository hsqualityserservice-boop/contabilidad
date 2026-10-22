import { del, get } from '@vercel/blob'
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { staffDocuments, userProfiles } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
const allowedTypes = new Set(['profile_photo', 'residence_permit', 'cfc', 'afp', 'other'])

function extensionFor(contentType: string) {
  if (contentType === 'image/jpeg') return 'jpg'
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  return 'pdf'
}

async function hasValidSignature(stream: ReadableStream<Uint8Array>, contentType: string) {
  const reader = stream.getReader()
  let bytes = new Uint8Array(0)
  try {
    while (bytes.length < 12) {
      const { done, value } = await reader.read()
      if (done) break
      const length = Math.min(12, bytes.length + value.length)
      const next = new Uint8Array(length)
      next.set(bytes)
      next.set(value.subarray(0, length - bytes.length), bytes.length)
      bytes = next
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }
  if (contentType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (contentType === 'image/png') return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)
  if (contentType === 'image/webp') return String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (contentType === 'application/pdf') return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
  return false
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Email verification required' }, { status: 403 })

  const [profile] = await db.select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (profile?.role !== 'staff' || profile.deletionRequestedAt || (profile.status !== 'pending' && profile.status !== 'active')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const action = body.action
  const type = body.type
  const contentType = body.contentType
  if (typeof type !== 'string' || !allowedTypes.has(type) || typeof contentType !== 'string' || !acceptedMimeTypes.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 })
  }
  if (type === 'profile_photo' && !contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'Profile photos must be images' }, { status: 400 })
  }

  if (action === 'discard') {
    if (typeof body.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)) {
      return NextResponse.json({ error: 'Invalid document' }, { status: 400 })
    }
    const [storedDocument] = await db.select({ id: staffDocuments.id }).from(staffDocuments)
      .where(and(eq(staffDocuments.id, body.id), eq(staffDocuments.userId, session.user.id))).limit(1)
    if (storedDocument) return NextResponse.json({ error: 'Document already finalized' }, { status: 409 })
    try {
      await del(`staff/${session.user.id}/${body.id}.${extensionFor(contentType)}`)
      return NextResponse.json({ ok: true })
    } catch {
      console.error('[staff-documents] Unable to discard unfinished private document')
      return NextResponse.json({ error: 'Unable to discard document' }, { status: 500 })
    }
  }

  if (action === 'token') {
    const size = body.size
    if (typeof body.originalName !== 'string' || body.originalName.length > 255 || !Number.isInteger(size) || (size as number) <= 0 || (size as number) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Unsupported file' }, { status: 400 })
    }
    const id = randomUUID()
    const pathname = `staff/${session.user.id}/${id}.${extensionFor(contentType)}`
    try {
      const token = await generateClientTokenFromReadWriteToken({
        pathname,
        allowedContentTypes: [contentType],
        maximumSizeInBytes: size as number,
        validUntil: Date.now() + 10 * 60 * 1000,
        addRandomSuffix: false,
        allowOverwrite: false,
      })
      return NextResponse.json({ id, pathname, token })
    } catch {
      console.error('[staff-documents] Unable to create a restricted upload token')
      return NextResponse.json({ error: 'Unable to prepare upload' }, { status: 500 })
    }
  }

  if (action !== 'finalize') return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  const id = body.id
  const size = body.size
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    || typeof body.originalName !== 'string' || body.originalName.length > 255
    || !Number.isInteger(size) || (size as number) <= 0 || (size as number) > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Unsupported file' }, { status: 400 })
  }

  const pathname = `staff/${session.user.id}/${id}.${extensionFor(contentType)}`
  const safeName = (body.originalName as string).replace(/[\\/\u0000-\u001f\u007f]/g, '_').slice(0, 180) || `document.${extensionFor(contentType)}`
  const [existingDocument] = await db.select({ type: staffDocuments.type, pathname: staffDocuments.pathname, originalName: staffDocuments.originalName, contentType: staffDocuments.contentType })
    .from(staffDocuments)
    .where(and(eq(staffDocuments.id, id), eq(staffDocuments.userId, session.user.id)))
    .limit(1)
  if (existingDocument) {
    const isSameUpload = existingDocument.type === type && existingDocument.pathname === pathname
      && existingDocument.originalName === safeName && existingDocument.contentType === contentType
    return isSameUpload
      ? NextResponse.json({ id })
      : NextResponse.json({ error: 'Document already finalized' }, { status: 409 })
  }

  let blob
  try {
    blob = await get(pathname, { access: 'private' })
  } catch {
    return NextResponse.json({ error: 'Uploaded file not found' }, { status: 400 })
  }
  if (!blob || blob.statusCode !== 200 || blob.blob.pathname !== pathname || blob.blob.contentType !== contentType || blob.blob.size !== size) {
    try { await del(pathname) } catch { console.error('[staff-documents] Unable to remove invalid private document') }
    return NextResponse.json({ error: 'Uploaded file did not pass validation' }, { status: 400 })
  }
  if (!(await hasValidSignature(blob.stream, contentType))) {
    try { await del(pathname) } catch { console.error('[staff-documents] Unable to remove invalid private document') }
    return NextResponse.json({ error: 'Invalid file content' }, { status: 400 })
  }

  try {
    const saved = await db.transaction(async (tx) => {
      const [currentProfile] = await tx.select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.user.id))
        .limit(1)
        .for('update')
      if (currentProfile?.role !== 'staff' || currentProfile.deletionRequestedAt || (currentProfile.status !== 'pending' && currentProfile.status !== 'active')) return false

      await tx.insert(staffDocuments).values({
        id,
        userId: session.user.id,
        type: type as 'profile_photo' | 'residence_permit' | 'cfc' | 'afp' | 'other',
        pathname,
        originalName: safeName,
        contentType,
      })
      return true
    })
    if (!saved) {
      await del(pathname)
      return NextResponse.json({ error: 'Account deletion is pending' }, { status: 403 })
    }
    return NextResponse.json({ id }, { status: 201 })
  } catch {
    try {
      const [storedDocument] = await db.select({ type: staffDocuments.type, pathname: staffDocuments.pathname, originalName: staffDocuments.originalName, contentType: staffDocuments.contentType })
        .from(staffDocuments)
        .where(and(eq(staffDocuments.id, id), eq(staffDocuments.userId, session.user.id)))
        .limit(1)
      if (storedDocument) {
        const isSameUpload = storedDocument.type === type && storedDocument.pathname === pathname
          && storedDocument.originalName === safeName && storedDocument.contentType === contentType
        return isSameUpload
          ? NextResponse.json({ id })
          : NextResponse.json({ error: 'Document already finalized' }, { status: 409 })
      }
    } catch {
      console.error('[staff-documents] Unable to verify document metadata after save error')
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
    try { await del(pathname) } catch { console.error('[staff-documents] Unable to remove orphaned private document') }
    console.error('[staff-documents] Unable to store private document metadata')
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
