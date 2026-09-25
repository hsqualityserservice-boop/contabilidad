'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { brandSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getBrandSettings() {
  const userId = await getUserId()
  const rows = await db.select().from(brandSettings).where(eq(brandSettings.userId, userId)).limit(1)
  return rows[0] ?? { companyName: 'H&S Quality Service', logoUrl: null, primaryColor: '#12243D', accentColor: '#20B8AE', surfaceColor: '#F5F7FA' }
}

export async function saveBrandSettings(input: { companyName: string; logoUrl?: string | null; primaryColor: string; accentColor: string; surfaceColor: string }) {
  const userId = await getUserId()
  const values = { userId, companyName: input.companyName.trim() || 'H&S Quality Service', logoUrl: input.logoUrl || null, primaryColor: input.primaryColor, accentColor: input.accentColor, surfaceColor: input.surfaceColor, updatedAt: new Date() }
  await db.insert(brandSettings).values(values).onConflictDoUpdate({ target: brandSettings.userId, set: values })
  return values
}

export async function updateBrandLogo(logoUrl: string | null) {
  const settings = await getBrandSettings()
  return saveBrandSettings({ ...settings, logoUrl })
}

export async function updateBrandColors(primaryColor: string, accentColor: string, surfaceColor: string) {
  const settings = await getBrandSettings()
  return saveBrandSettings({ ...settings, primaryColor, accentColor, surfaceColor })
}
