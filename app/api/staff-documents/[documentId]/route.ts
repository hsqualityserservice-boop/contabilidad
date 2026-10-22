import { del, get } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { staffDocuments, userProfiles } from '@/lib/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { documentId } = await params
  const [document] = await db.select().from(staffDocuments)
    .where(eq(staffDocuments.id, documentId)).limit(1)
  if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [viewer] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  const isOwner = session.user.emailVerified && document.userId === session.user.id && viewer?.role === 'staff' && (viewer.status === 'pending' || viewer.status === 'active')
  const isAdmin = session.user.emailVerified && viewer?.role === 'admin' && viewer.status === 'active'
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const result = await get(document.pathname, { access: 'private' })
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': document.contentType,
        'Content-Disposition': document.contentType.startsWith('image/') ? 'inline' : 'attachment; filename="staff-document.pdf"',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch {
    console.error('[staff-documents] Unable to serve private document')
    return NextResponse.json({ error: 'Unable to retrieve document' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!session.user.emailVerified) return NextResponse.json({ error: 'Email verification required' }, { status: 403 })

  const { documentId } = await params
  const [profile] = await db.select({
    role: userProfiles.role,
    status: userProfiles.status,
    profilePhotoPath: userProfiles.profilePhotoPath,
  }).from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (profile?.role !== 'staff' || (profile.status !== 'pending' && profile.status !== 'active')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [document] = await db.select({ id: staffDocuments.id, pathname: staffDocuments.pathname })
    .from(staffDocuments)
    .where(and(
      eq(staffDocuments.id, documentId),
      eq(staffDocuments.userId, session.user.id),
      gt(staffDocuments.createdAt, new Date(Date.now() - 15 * 60 * 1000)),
    ))
    .limit(1)
  if (!document) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (profile.profilePhotoPath === document.pathname) {
    return NextResponse.json({ error: 'Document is in use' }, { status: 409 })
  }

  try {
    await del(document.pathname)
    await db.delete(staffDocuments).where(and(
      eq(staffDocuments.id, document.id),
      eq(staffDocuments.userId, session.user.id),
    ))
    return NextResponse.json({ ok: true })
  } catch {
    console.error('[staff-documents] Unable to remove private document')
    return NextResponse.json({ error: 'Unable to remove document' }, { status: 500 })
  }
}
