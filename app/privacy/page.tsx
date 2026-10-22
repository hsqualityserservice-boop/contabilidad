import type { Metadata } from 'next'
import { LegalDocumentPage, getLegalMetadata } from '@/components/legal-document'
import { getLocale } from '@/lib/locale-server'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return getLegalMetadata('privacy', locale)
}

export default async function PrivacyPage() {
  const locale = await getLocale()
  return <LegalDocumentPage kind="privacy" locale={locale} />
}
