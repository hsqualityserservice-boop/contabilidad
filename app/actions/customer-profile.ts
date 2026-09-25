'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { customerProfile } from '@/lib/db/schema'
import { headers } from 'next/headers'

export type CustomerType = 'particular' | 'empresa'

export interface CustomerProfileInput {
  customerType: CustomerType
  firstName?: string
  lastName?: string
  phone?: string
  address: string
  companyName?: string
  vatNumber?: string
}

export async function saveCustomerProfile(input: CustomerProfileInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const values = {
    customerType: input.customerType,
    firstName: input.firstName?.trim() || null,
    lastName: input.lastName?.trim() || null,
    phone: input.phone?.trim() || null,
    address: input.address.trim(),
    companyName: input.companyName?.trim() || null,
    vatNumber: input.vatNumber?.trim() || null,
  }

  const validParticular = values.customerType === 'particular' && values.firstName && values.lastName && values.phone && !values.companyName && !values.vatNumber
  const validEmpresa = values.customerType === 'empresa' && values.companyName && values.vatNumber && !values.firstName && !values.lastName && !values.phone
  if (!values.address || (!validParticular && !validEmpresa)) throw new Error('Invalid profile')

  await db.insert(customerProfile).values({
    id: `profile-${crypto.randomUUID()}`,
    userId: session.user.id,
    ...values,
  }).onConflictDoUpdate({ target: customerProfile.userId, set: { ...values, updatedAt: new Date() } })
}
