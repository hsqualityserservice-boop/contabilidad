import type { Metadata } from 'next'
import { LegalDocumentPage, getLegalMetadata } from '@/components/legal-document'
import { getLocale } from '@/lib/locale-server'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  return getLegalMetadata('terms', locale)
}

export default async function TermsPage() {
  const locale = await getLocale()
  return <LegalDocumentPage kind="terms" locale={locale} />
}
