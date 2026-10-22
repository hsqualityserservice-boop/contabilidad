import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client'
import { issueSignedToken } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const allowedTypes = new Set(['profile_photo', 'residence_permit', 'cfc', 'afp', 'other'])
const allowedContentTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

function extensionFor(contentType: string) {
  if (contentType === 'image/jpeg') return 'jpg'
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  return 'pdf'
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

  let body: HandleUploadPresignedBody
  try {
    body = await request.json() as HandleUploadPresignedBody
  } catch {
    return NextResponse.json({ error: 'Invalid upload request' }, { status: 400 })
  }

  try {
    const result = await handleUploadPresigned({
      request,
      body,
      getSignedToken: async (pathname, clientPayload) => {
        let metadata: { type?: unknown; contentType?: unknown }
        try {
          metadata = JSON.parse(clientPayload ?? '') as { type?: unknown; contentType?: unknown }
        } catch {
          throw new Error('Invalid upload metadata')
        }

        if (typeof metadata.type !== 'string' || !allowedTypes.has(metadata.type)) throw new Error('Invalid document type')
        if (typeof metadata.contentType !== 'string' || !allowedContentTypes.has(metadata.contentType)) throw new Error('Unsupported file type')
        if (metadata.type === 'profile_photo' && !metadata.contentType.startsWith('image/')) throw new Error('Profile photos must be images')

        const prefix = `staff/${session.user.id}/`
        const fileName = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : ''
        const match = fileName.match(/^([0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.(jpg|png|webp|pdf)$/i)
        if (!match || extensionFor(metadata.contentType) !== match[2]) throw new Error('Invalid upload path')

        return {
          token: await issueSignedToken({
            pathname,
            operations: ['put'],
            allowedContentTypes: [metadata.contentType],
            maximumSizeInBytes: MAX_FILE_SIZE,
            validUntil: Date.now() + 10 * 60 * 1000,
          }),
        }
      },
    })
    return NextResponse.json(result)
  } catch {
    console.error('[staff-documents] Unable to authorize private upload')
    return NextResponse.json({ error: 'Unable to authorize upload' }, { status: 500 })
  }
}
