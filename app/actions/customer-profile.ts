'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { customerProfile } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { randomUUID } from 'node:crypto'

export type CustomerRegistration = {
  customerType: 'particular' | 'company'
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  companyName?: string
  taxAddress?: string
  vatNumber?: string
}

export async function saveCustomerProfile(input: CustomerRegistration) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const required = input.customerType === 'particular'
    ? [input.firstName, input.lastName, input.phone, input.address]
    : [input.companyName, input.taxAddress, input.vatNumber]
  if (!['particular', 'company'].includes(input.customerType) || required.some((value) => !value?.trim())) {
    throw new Error('Invalid registration data')
  }

  await db.insert(customerProfile).values({
    id: randomUUID(), userId: session.user.id, customerType: input.customerType,
    firstName: input.firstName?.trim(), lastName: input.lastName?.trim(), phone: input.phone?.trim(), address: input.address?.trim(),
    companyName: input.companyName?.trim(), taxAddress: input.taxAddress?.trim(), vatNumber: input.vatNumber?.trim(),
  }).onConflictDoUpdate({ target: customerProfile.userId, set: {
    customerType: input.customerType, firstName: input.firstName?.trim(), lastName: input.lastName?.trim(), phone: input.phone?.trim(), address: input.address?.trim(), companyName: input.companyName?.trim(), taxAddress: input.taxAddress?.trim(), vatNumber: input.vatNumber?.trim(),
  } })
}
