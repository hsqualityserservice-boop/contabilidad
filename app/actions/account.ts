'use server'

import { del } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clientServiceRequests, serviceScheduleProposals, staffDocuments, staffInvites, staffWeeklyAvailability, user, userProfiles, verification } from '@/lib/db/schema'
import { calculateClientQuote, getClientPostalCanton, type ClientCanton, type ClientPropertyType, type ClientQuoteDetails, type ClientServiceType } from '@/lib/client-pricing'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { isInitialAdminEmail } from '@/lib/admin-bootstrap'
import { and, count, desc, eq, gt, inArray, isNotNull, isNull } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const profileInputSchema = z.object({
  accessType: z.enum(['customer', 'staff']),
  accountType: z.enum(['private', 'professional']),
  phone: z.string().trim().min(6).max(30),
  streetAddress: z.string().trim().min(4).max(180),
  postalCode: z.string().trim().min(3).max(16),
  city: z.string().trim().min(2).max(100),
  companyName: z.string().trim().max(180).optional(),
  companyIde: z.string().trim().max(24).optional(),
  inviteCode: z.string().trim().max(40).optional(),
})

export async function createAccountProfile(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false as const, error: 'No se pudo completar el registro. Vuelve a intentarlo.' }

  const parsed = profileInputSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Revisa los datos y vuelve a intentarlo.' }

  const values = parsed.data
  const isInitialAdmin = isInitialAdminEmail(session.user.email)
  const isVerifiedInitialAdmin = isInitialAdmin && session.user.emailVerified
  const newRole: 'admin' | 'customer' | 'staff' = isVerifiedInitialAdmin ? 'admin' : isInitialAdmin ? 'customer' : values.accessType === 'staff' ? 'staff' : 'customer'
  const newStatus: 'active' | 'pending' = isInitialAdmin || values.accessType === 'customer' ? 'active' : 'pending'
  const newAccountType = isInitialAdmin || values.accessType === 'customer' ? values.accountType : null
  const professionalCustomer = values.accessType === 'customer' && values.accountType === 'professional'
  const ide = values.companyIde?.toUpperCase().replaceAll(' ', '')

  if (professionalCustomer) {
    if (!values.companyName || !ide || !/^CHE-?\d{3}\.\d{3}\.\d{3}$/.test(ide)) {
      return { ok: false as const, error: 'Introduce la razón social y un IDE suizo válido (CHE-123.456.789).' }
    }
  }

  const [existing] = await db
    .select({ role: userProfiles.role })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (existing) {
    if (isVerifiedInitialAdmin) {
      await db
        .update(userProfiles)
        .set({ role: 'admin', status: 'active', updatedAt: new Date() })
        .where(eq(userProfiles.userId, session.user.id))
    }

    const destination = isVerifiedInitialAdmin || existing.role === 'admin'
      ? '/admin'
      : existing.role === 'staff'
        ? '/staff'
        : '/account'
    return { ok: true as const, destination }
  }

  if (values.accessType === 'staff' && !values.inviteCode) {
    return { ok: false as const, error: 'El código personal no es válido o ha caducado.' }
  }

  const profileValues = {
    userId: session.user.id,
    role: newRole,
    status: newStatus,
    accountType: newAccountType,
    phone: values.phone,
    streetAddress: values.streetAddress,
    postalCode: values.postalCode,
    city: values.city,
    country: 'CH',
    companyName: professionalCustomer ? values.companyName : null,
    companyIde: professionalCustomer ? ide : null,
  }

  if (values.accessType === 'staff' && values.inviteCode) {
    const normalizedCode = values.inviteCode.toUpperCase().replaceAll('-', '').replaceAll(' ', '')
    if (!/^[A-F0-9]{32}$/.test(normalizedCode)) {
      return { ok: false as const, error: 'El código personal no es válido o ha caducado.' }
    }

    try {
      const inviteAccepted = await db.transaction(async (tx) => {
        const [invite] = await tx
          .update(staffInvites)
          .set({ redeemedAt: new Date() })
          .where(and(
            eq(staffInvites.codeHash, createHash('sha256').update(normalizedCode).digest('hex')),
            eq(staffInvites.email, session.user.email.trim().toLowerCase()),
            isNull(staffInvites.redeemedAt),
            gt(staffInvites.expiresAt, new Date()),
          ))
          .returning({ id: staffInvites.id })
        if (!invite) return false

        await tx.insert(userProfiles).values({ ...profileValues, role: 'staff', status: 'pending', accountType: null })
        return true
      })

      if (!inviteAccepted) return { ok: false as const, error: 'El código personal no es válido o ha caducado.' }
      return { ok: true as const, destination: '/staff' }
    } catch {
      console.error('[auth] Unable to redeem staff invitation')
      return { ok: false as const, error: 'No se pudo completar el registro. Vuelve a intentarlo.' }
    }
  }

  try {
    await db.insert(userProfiles).values(profileValues)
  } catch {
    console.error('[auth] Unable to create account profile')
    return { ok: false as const, error: 'No se pudo completar el registro. Vuelve a intentarlo.' }
  }

  return {
    ok: true as const,
    destination: isVerifiedInitialAdmin ? '/admin' : isInitialAdmin ? '/account' : values.accessType === 'staff' ? '/staff' : '/account',
  }
}

const assignedStaffProfile = alias(userProfiles, 'assigned_staff_profile')
const assignedStaffUser = alias(user, 'assigned_staff_user')
const serviceCustomerProfile = alias(userProfiles, 'service_customer_profile')

const staffInviteSchema = z.object({ email: z.string().trim().email().max(254) })

export async function validateStaffInvite(input: unknown) {
  const parsed = z.object({ email: z.string().trim().email().max(254), code: z.string().trim().max(40) }).safeParse(input)
  if (!parsed.success) return false
  const code = parsed.data.code.toUpperCase().replaceAll('-', '').replaceAll(' ', '')
  if (!/^[A-F0-9]{32}$/.test(code)) return false

  const [invite] = await db.select({ id: staffInvites.id }).from(staffInvites).where(and(
    eq(staffInvites.codeHash, createHash('sha256').update(code).digest('hex')),
    eq(staffInvites.email, parsed.data.email.toLowerCase()),
    isNull(staffInvites.redeemedAt),
    gt(staffInvites.expiresAt, new Date()),
  )).limit(1)
  return Boolean(invite)
}

export async function createStaffInvite(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return { ok: false as const, error: 'No autorizado.' }

  const [admin] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)
  if (admin?.role !== 'admin' || admin.status !== 'active') return { ok: false as const, error: 'No autorizado.' }

  const parsed = staffInviteSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'Introduce un correo válido.' }
  const email = parsed.data.email.toLowerCase()
  const [existingUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)
  if (existingUser) return { ok: false as const, error: 'Ese correo ya tiene una cuenta.' }

  const code = randomBytes(16).toString('hex').toUpperCase()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  try {
    await db.update(staffInvites)
      .set({ expiresAt: new Date() })
      .where(and(eq(staffInvites.email, email), isNull(staffInvites.redeemedAt)))
    await db.insert(staffInvites).values({
      id: randomUUID(),
      codeHash: createHash('sha256').update(code).digest('hex'),
      email,
      createdBy: session.user.id,
      expiresAt,
    })
  } catch {
    console.error('[admin] Unable to create staff invite')
    return { ok: false as const, error: 'No se pudo generar el código. Inténtalo de nuevo.' }
  }

  revalidatePath('/admin')
  return { ok: true as const, code, expiresAt: expiresAt.toISOString() }
}

const staffDossierSchema = z.object({
  nationality: z.string().trim().min(2).max(80),
  residencePermitType: z.enum(['B', 'C', 'L', 'G', 'F', 'N', 'Ci', 'other']),
  residencePermitExpiry: z.string().date(),
  workExperience: z.string().trim().min(10).max(4000),
  photoDocumentId: z.string().uuid(),
  permitDocumentId: z.string().uuid(),
})

export async function saveStaffDossier(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return { ok: false as const, error: 'Confirma tu correo electrónico antes de guardar el expediente.' }

  const parsed = staffDossierSchema.safeParse({
    nationality: formData.get('nationality'),
    residencePermitType: formData.get('residencePermitType'),
    residencePermitExpiry: formData.get('residencePermitExpiry'),
    workExperience: formData.get('workExperience'),
    photoDocumentId: formData.get('photoDocumentId'),
    permitDocumentId: formData.get('permitDocumentId'),
  })
  if (!parsed.success) return { ok: false as const, error: 'Completa los datos y adjunta la foto y el permiso de residencia.' }

  const [profile] = await db
    .select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)
  if (profile?.role !== 'staff' || profile.deletionRequestedAt || (profile.status !== 'pending' && profile.status !== 'active')) return { ok: false as const, error: 'No autorizado.' }

  const values = parsed.data
  const docs = await db.select().from(staffDocuments).where(and(
    eq(staffDocuments.userId, session.user.id),
    inArray(staffDocuments.id, [values.photoDocumentId, values.permitDocumentId]),
  ))
  const photo = docs.find((document) => document.id === values.photoDocumentId && document.type === 'profile_photo')
  const permit = docs.find((document) => document.id === values.permitDocumentId && document.type === 'residence_permit')
  if (!photo || !permit) return { ok: false as const, error: 'No se pudieron verificar los archivos adjuntos.' }

  try {
    await db.update(userProfiles).set({
      nationality: values.nationality,
      residencePermitType: values.residencePermitType,
      residencePermitExpiry: values.residencePermitExpiry,
      profilePhotoPath: photo.pathname,
      workExperience: values.workExperience,
      updatedAt: new Date(),
    }).where(and(eq(userProfiles.userId, session.user.id), isNull(userProfiles.deletionRequestedAt)))
  } catch {
    console.error('[staff] Unable to save staff dossier')
    return { ok: false as const, error: 'No se pudo guardar el expediente. Inténtalo de nuevo.' }
  }

  revalidatePath('/staff')
  revalidatePath('/admin')
  return { ok: true as const }
}

export async function approveStaffApplication(userId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return

  const [admin] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (admin?.role !== 'admin' || admin.status !== 'active') return

  const [candidate] = await db
    .select({
      nationality: userProfiles.nationality,
      residencePermitType: userProfiles.residencePermitType,
      residencePermitExpiry: userProfiles.residencePermitExpiry,
      profilePhotoPath: userProfiles.profilePhotoPath,
      workExperience: userProfiles.workExperience,
      deletionRequestedAt: userProfiles.deletionRequestedAt,
    })
    .from(userProfiles)
    .innerJoin(user, eq(userProfiles.userId, user.id))
    .where(and(
      eq(userProfiles.userId, userId),
      eq(userProfiles.role, 'staff'),
      eq(userProfiles.status, 'pending'),
      isNull(userProfiles.deletionRequestedAt),
      eq(user.emailVerified, true),
    ))
    .limit(1)
  if (!candidate?.nationality || !candidate.residencePermitType || !candidate.residencePermitExpiry || !candidate.profilePhotoPath || !candidate.workExperience) return

  const [permitDocument] = await db.select({ id: staffDocuments.id }).from(staffDocuments).where(and(
    eq(staffDocuments.userId, userId),
    eq(staffDocuments.type, 'residence_permit'),
  )).limit(1)
  if (!permitDocument || candidate.residencePermitExpiry <= new Date().toISOString().slice(0, 10)) return

  await db
    .update(userProfiles)
    .set({ status: 'active', updatedAt: new Date() })
    .where(and(
      eq(userProfiles.userId, userId),
      eq(userProfiles.role, 'staff'),
      eq(userProfiles.status, 'pending'),
      isNull(userProfiles.deletionRequestedAt),
    ))

  revalidatePath('/admin')
}

export async function rejectStaffApplication(userId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return

  const [admin] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (admin?.role !== 'admin' || admin.status !== 'active') return

  await db
    .update(userProfiles)
    .set({ status: 'suspended', updatedAt: new Date() })
    .where(and(
      eq(userProfiles.userId, userId),
      eq(userProfiles.role, 'staff'),
      eq(userProfiles.status, 'pending'),
    ))

  revalidatePath('/admin')
}

export async function getCurrentAccount() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null

  const [profile] = await db
    .select({
      role: userProfiles.role,
      status: userProfiles.status,
      accountType: userProfiles.accountType,
      phone: userProfiles.phone,
      streetAddress: userProfiles.streetAddress,
      postalCode: userProfiles.postalCode,
      city: userProfiles.city,
      country: userProfiles.country,
      companyName: userProfiles.companyName,
      companyIde: userProfiles.companyIde,
    })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  return profile ? { user: { name: session.user.name, email: session.user.email }, profile } : null
}

const clientRequestSchema = z.object({
  serviceType: z.enum(['prive_regular', 'fin_de_bail', 'fin_travaux', 'bureaux', 'cabinet_medical', 'conciergerie', 'airbnb']),
  canton: z.enum(['GE', 'VD', 'FR', 'NE', 'VS']),
  postalCode: z.string().regex(/^\d{4}$/),
  bathrooms: z.coerce.number().int().min(1).max(20),
  surfaceArea: z.coerce.number().int().min(1).max(1000),
  windowArea: z.coerce.number().int().min(0).max(1000),
  terraceArea: z.coerce.number().int().min(0).max(1000),
  includeOven: z.boolean(),
  includeFridge: z.boolean(),
  includeWindows: z.boolean(),
  includeTerrace: z.boolean(),
  propertyType: z.enum(['apartment', 'studio', 'house', 'farm', 'office', 'shop', 'airbnb']),
  bedrooms: z.coerce.number().int().min(0).max(30),
  kitchens: z.coerce.number().int().min(0).max(10),
  livingRooms: z.coerce.number().int().min(0).max(20),
  offices: z.coerce.number().int().min(0).max(30),
  tables: z.coerce.number().int().min(0).max(100),
  desks: z.coerce.number().int().min(0).max(100),
  vitrines: z.coerce.number().int().min(0).max(100),
  windows: z.coerce.number().int().min(0).max(200),
  wallArea: z.coerce.number().int().min(0).max(1000),
  cleanWalls: z.boolean(),
  postConstructionDust: z.boolean(),
  paintMarks: z.boolean(),
  parkingAvailable: z.boolean(),
  keyHandover: z.boolean(),
  preferredDate: z.string().date().nullable(),
  message: z.string().trim().max(1000),
  termsAccepted: z.boolean().refine((accepted) => accepted, 'Debes aceptar las condiciones y la política de privacidad.'),
}).superRefine((request, context) => {
  if (request.includeWindows && request.windowArea < 1) {
    context.addIssue({ code: 'custom', path: ['windowArea'], message: 'Indica la superficie de las ventanas.' })
  }
  if (request.includeTerrace && request.terraceArea < 1) {
    context.addIssue({ code: 'custom', path: ['terraceArea'], message: 'Indica la superficie de la terraza.' })
  }
  if ((request.cleanWalls || request.paintMarks) && request.wallArea < 1) {
    context.addIssue({ code: 'custom', path: ['wallArea'], message: 'Indica la superficie de los muros.' })
  }
})

export async function submitClientServiceRequest(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false as const, error: 'Inicia sesión para enviar tu solicitud.' }
  if (!session.user.emailVerified) return { ok: false as const, error: 'Confirma tu correo electrónico antes de enviar una solicitud.' }

  const [profile] = await db
    .select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)
  if (profile?.role !== 'customer' || profile.status !== 'active' || profile.deletionRequestedAt) {
    return { ok: false as const, error: 'Esta cuenta no puede enviar solicitudes de servicio.' }
  }

  const parsed = clientRequestSchema.safeParse({
    serviceType: formData.get('serviceType'),
    canton: formData.get('canton'),
    postalCode: formData.get('postalCode'),
    bathrooms: formData.get('bathrooms'),
    surfaceArea: formData.get('surfaceArea'),
    windowArea: formData.get('windowArea') || '0',
    terraceArea: formData.get('terraceArea') || '0',
    includeOven: formData.get('includeOven') === 'on',
    includeFridge: formData.get('includeFridge') === 'on',
    includeWindows: formData.get('includeWindows') === 'on',
    includeTerrace: formData.get('includeTerrace') === 'on',
    propertyType: formData.get('propertyType'),
    bedrooms: formData.get('bedrooms') ?? '0',
    kitchens: formData.get('kitchens') ?? '0',
    livingRooms: formData.get('livingRooms') ?? '0',
    offices: formData.get('offices') ?? '0',
    tables: formData.get('tables') ?? '0',
    desks: formData.get('desks') ?? '0',
    vitrines: formData.get('vitrines') ?? '0',
    windows: formData.get('windows') ?? '0',
    wallArea: formData.get('wallArea') || '0',
    cleanWalls: formData.get('cleanWalls') === 'on',
    postConstructionDust: formData.get('postConstructionDust') === 'on',
    paintMarks: formData.get('paintMarks') === 'on',
    parkingAvailable: formData.get('parkingAvailable') === 'on',
    keyHandover: formData.get('keyHandover') === 'on',
    preferredDate: formData.get('preferredDate') || null,
    message: formData.get('message') ?? '',
    termsAccepted: formData.get('termsAccepted') === 'on',
  })
  if (!parsed.success) return { ok: false as const, error: 'Revisa el tipo de servicio, la zona y las superficies.' }

  const values = parsed.data
  const quoteDetails: ClientQuoteDetails = {
    propertyType: values.propertyType as ClientPropertyType,
    bedrooms: values.bedrooms,
    kitchens: values.kitchens,
    livingRooms: values.livingRooms,
    offices: values.offices,
    tables: values.tables,
    desks: values.desks,
    vitrines: values.vitrines,
    windows: values.windows,
    wallArea: values.wallArea,
    cleanWalls: values.cleanWalls,
    postConstructionDust: values.postConstructionDust,
    paintMarks: values.paintMarks,
    parkingAvailable: values.parkingAvailable,
    keyHandover: values.keyHandover,
    legalTermsAcceptedAt: new Date().toISOString(),
  }
  if (values.preferredDate && values.preferredDate < new Date(Date.now() + 86400000).toISOString().slice(0, 10)) {
    return { ok: false as const, error: 'Elige una fecha a partir de mañana.' }
  }
  const quote = calculateClientQuote({
    serviceType: values.serviceType as ClientServiceType,
    canton: (getClientPostalCanton(values.postalCode) ?? values.canton) as ClientCanton,
    postalCode: values.postalCode,
    bathrooms: values.bathrooms,
    surfaceArea: values.surfaceArea,
    windowArea: values.windowArea,
    terraceArea: values.terraceArea,
    includeOven: values.includeOven,
    includeFridge: values.includeFridge,
    includeWindows: values.includeWindows,
    includeTerrace: values.includeTerrace,
    details: quoteDetails,
  })

  try {
    const saved = await db.transaction(async (tx) => {
      const [currentProfile] = await tx
        .select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
        .from(userProfiles)
        .where(eq(userProfiles.userId, session.user.id))
        .limit(1)
        .for('update')
      if (currentProfile?.role !== 'customer' || currentProfile.status !== 'active' || currentProfile.deletionRequestedAt) return false

      await tx.insert(clientServiceRequests).values({
        id: randomUUID(),
        userId: session.user.id,
        serviceType: values.serviceType,
        canton: getClientPostalCanton(values.postalCode) ?? values.canton,
        postalCode: values.postalCode,
        bathrooms: values.bathrooms,
        surfaceArea: values.surfaceArea,
        windowArea: values.windowArea,
        terraceArea: values.terraceArea,
        includeOven: values.includeOven,
        includeFridge: values.includeFridge,
        includeWindows: values.includeWindows,
        includeTerrace: values.includeTerrace,
        quoteDetails,
        preferredDate: values.preferredDate,
        message: values.message,
        estimatedPrice: quote.total,
        estimatedHours: quote.hours,
        crewSize: quote.crewSize,
        status: 'requested',
      })
      return true
    })
    if (!saved) return { ok: false as const, error: 'Esta cuenta no puede enviar solicitudes de servicio.' }
  } catch {
    console.error('[account] Unable to save client service request')
    return { ok: false as const, error: 'No se pudo guardar la solicitud. Inténtalo de nuevo.' }
  }

  revalidatePath('/account')
  revalidatePath('/admin')
  revalidatePath('/workspace')
  return { ok: true as const }
}

export async function getClientServiceRequests() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return []

  return db
    .select({
      id: clientServiceRequests.id,
      serviceType: clientServiceRequests.serviceType,
      canton: clientServiceRequests.canton,
      postalCode: clientServiceRequests.postalCode,
      bathrooms: clientServiceRequests.bathrooms,
      surfaceArea: clientServiceRequests.surfaceArea,
      windowArea: clientServiceRequests.windowArea,
      quoteDetails: clientServiceRequests.quoteDetails,
      estimatedPrice: clientServiceRequests.estimatedPrice,
      estimatedHours: clientServiceRequests.estimatedHours,
      crewSize: clientServiceRequests.crewSize,
      preferredDate: clientServiceRequests.preferredDate,
      confirmedDate: clientServiceRequests.confirmedDate,
      confirmedPrice: clientServiceRequests.confirmedPrice,
      assignedStaffName: assignedStaffUser.name,
      proposalDate: serviceScheduleProposals.appointmentDate,
      proposalStartTime: serviceScheduleProposals.startTime,
      proposalEndTime: serviceScheduleProposals.endTime,
      proposalStatus: serviceScheduleProposals.status,
      status: clientServiceRequests.status,
      createdAt: clientServiceRequests.createdAt,
    })
    .from(clientServiceRequests)
    .leftJoin(serviceScheduleProposals, eq(clientServiceRequests.id, serviceScheduleProposals.requestId))
    .leftJoin(assignedStaffProfile, eq(clientServiceRequests.assignedStaffUserId, assignedStaffProfile.userId))
    .leftJoin(assignedStaffUser, eq(assignedStaffProfile.userId, assignedStaffUser.id))
    .where(eq(clientServiceRequests.userId, session.user.id))
    .orderBy(desc(clientServiceRequests.createdAt))
}

export async function getOperationsServiceRequests() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return null

  const [operator] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)
  if (operator?.role !== 'admin' || operator.status !== 'active') return null

  return db
    .select({
      id: clientServiceRequests.id,
      userId: clientServiceRequests.userId,
      name: user.name,
      email: user.email,
      serviceType: clientServiceRequests.serviceType,
      canton: clientServiceRequests.canton,
      postalCode: clientServiceRequests.postalCode,
      bathrooms: clientServiceRequests.bathrooms,
      surfaceArea: clientServiceRequests.surfaceArea,
      windowArea: clientServiceRequests.windowArea,
      terraceArea: clientServiceRequests.terraceArea,
      includeOven: clientServiceRequests.includeOven,
      includeFridge: clientServiceRequests.includeFridge,
      includeWindows: clientServiceRequests.includeWindows,
      includeTerrace: clientServiceRequests.includeTerrace,
      quoteDetails: clientServiceRequests.quoteDetails,
      estimatedPrice: clientServiceRequests.estimatedPrice,
      estimatedHours: clientServiceRequests.estimatedHours,
      crewSize: clientServiceRequests.crewSize,
      preferredDate: clientServiceRequests.preferredDate,
      confirmedDate: clientServiceRequests.confirmedDate,
      confirmedPrice: clientServiceRequests.confirmedPrice,
      assignedStaffUserId: clientServiceRequests.assignedStaffUserId,
      assignedStaffName: assignedStaffUser.name,
      proposalDate: serviceScheduleProposals.appointmentDate,
      proposalStartTime: serviceScheduleProposals.startTime,
      proposalEndTime: serviceScheduleProposals.endTime,
      proposalStatus: serviceScheduleProposals.status,
      message: clientServiceRequests.message,
      status: clientServiceRequests.status,
      createdAt: clientServiceRequests.createdAt,
    })
    .from(clientServiceRequests)
    .innerJoin(user, eq(clientServiceRequests.userId, user.id))
    .leftJoin(serviceScheduleProposals, eq(clientServiceRequests.id, serviceScheduleProposals.requestId))
    .leftJoin(assignedStaffProfile, eq(clientServiceRequests.assignedStaffUserId, assignedStaffProfile.userId))
    .leftJoin(assignedStaffUser, eq(assignedStaffProfile.userId, assignedStaffUser.id))
    .orderBy(desc(clientServiceRequests.createdAt))
}

export async function getAssignableStaff() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return []
  const [operator] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (operator?.role !== 'admin' || operator.status !== 'active') return []

  return db.select({ userId: userProfiles.userId, name: user.name })
    .from(userProfiles)
    .innerJoin(user, eq(userProfiles.userId, user.id))
    .where(and(eq(userProfiles.role, 'staff'), eq(userProfiles.status, 'active'), eq(user.emailVerified, true), isNull(userProfiles.deletionRequestedAt)))
    .orderBy(user.name)
}

export async function updateClientRequestStatus(requestId: string, status: 'reviewing' | 'completed' | 'cancelled', _formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const [operator] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (operator?.role !== 'admin' || operator.status !== 'active') return

  const parsedId = z.string().uuid().safeParse(requestId)
  const parsedStatus = z.enum(['reviewing', 'completed', 'cancelled']).safeParse(status)
  if (!parsedId.success || !parsedStatus.success) return

  const updated = await db.transaction(async (tx) => {
    const [request] = await tx.select({ status: clientServiceRequests.status })
      .from(clientServiceRequests).where(eq(clientServiceRequests.id, parsedId.data)).limit(1).for('update')
    if (!request) return false
    const allowedNext: Record<typeof request.status, string[]> = {
      requested: ['reviewing', 'cancelled'],
      reviewing: ['cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    }
    if (!allowedNext[request.status].includes(parsedStatus.data)) return false
    const [changed] = await tx.update(clientServiceRequests).set({ status: parsedStatus.data })
      .where(and(eq(clientServiceRequests.id, parsedId.data), eq(clientServiceRequests.status, request.status)))
      .returning({ id: clientServiceRequests.id })
    if (!changed) return false
    if (parsedStatus.data === 'cancelled') await tx.update(serviceScheduleProposals)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(serviceScheduleProposals.requestId, parsedId.data), inArray(serviceScheduleProposals.status, ['proposed', 'client_accepted', 'approved'])))
    return true
  })
  if (!updated) return
  revalidatePath('/admin')
  revalidatePath('/staff')
  revalidatePath('/account')
  revalidatePath('/workspace')
}

export async function cancelClientServiceRequest(requestId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const parsedId = z.string().uuid().safeParse(requestId)
  if (!parsedId.success) return

  await db.transaction(async (tx) => {
    const [cancelled] = await tx.update(clientServiceRequests)
      .set({ status: 'cancelled' })
      .where(and(
        eq(clientServiceRequests.id, parsedId.data),
        eq(clientServiceRequests.userId, session.user.id),
        inArray(clientServiceRequests.status, ['requested', 'reviewing']),
      ))
      .returning({ id: clientServiceRequests.id })
    if (cancelled) await tx.update(serviceScheduleProposals).set({ status: 'cancelled', updatedAt: new Date() }).where(and(eq(serviceScheduleProposals.requestId, parsedId.data), inArray(serviceScheduleProposals.status, ['proposed', 'client_accepted'])))
  })
  revalidatePath('/account')
  revalidatePath('/admin')
  revalidatePath('/workspace')
}

export async function getAssignedStaffServiceRequests() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return []
  const [staffMember] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (staffMember?.role !== 'staff' || staffMember.status !== 'active') return []

  return db.select({
    id: clientServiceRequests.id,
    clientName: user.name,
    clientPhone: serviceCustomerProfile.phone,
    streetAddress: serviceCustomerProfile.streetAddress,
    postalCode: serviceCustomerProfile.postalCode,
    city: serviceCustomerProfile.city,
    serviceType: clientServiceRequests.serviceType,
    canton: clientServiceRequests.canton,
    surfaceArea: clientServiceRequests.surfaceArea,
    bathrooms: clientServiceRequests.bathrooms,
    windowArea: clientServiceRequests.windowArea,
    terraceArea: clientServiceRequests.terraceArea,
    includeOven: clientServiceRequests.includeOven,
    includeFridge: clientServiceRequests.includeFridge,
    includeWindows: clientServiceRequests.includeWindows,
    includeTerrace: clientServiceRequests.includeTerrace,
    quoteDetails: clientServiceRequests.quoteDetails,
    confirmedDate: clientServiceRequests.confirmedDate,
    confirmedPrice: clientServiceRequests.confirmedPrice,
    message: clientServiceRequests.message,
    status: clientServiceRequests.status,
  }).from(clientServiceRequests)
    .innerJoin(user, eq(clientServiceRequests.userId, user.id))
    .leftJoin(serviceCustomerProfile, eq(clientServiceRequests.userId, serviceCustomerProfile.userId))
    .where(eq(clientServiceRequests.assignedStaffUserId, session.user.id))
    .orderBy(desc(clientServiceRequests.confirmedDate))
}

export async function completeAssignedServiceRequest(requestId: string, _formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const [staffMember] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (staffMember?.role !== 'staff' || staffMember.status !== 'active') return

  const parsedId = z.string().uuid().safeParse(requestId)
  if (!parsedId.success) return
  await db.update(clientServiceRequests)
    .set({ status: 'completed' })
    .where(and(
      eq(clientServiceRequests.id, parsedId.data),
      eq(clientServiceRequests.assignedStaffUserId, session.user.id),
      eq(clientServiceRequests.status, 'confirmed'),
    ))
  revalidatePath('/staff')
  revalidatePath('/admin')
  revalidatePath('/account')
  revalidatePath('/workspace')
}

export async function requestAccountDeletion() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false as const, error: 'No se pudo verificar la sesión.' }

  const result = await db.transaction(async (tx) => {
    const [profile] = await tx.select({ role: userProfiles.role, deletionRequestedAt: userProfiles.deletionRequestedAt })
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1)
      .for('update')
    if (profile?.role !== 'customer' && profile?.role !== 'staff') return 'unavailable' as const
    if (profile.deletionRequestedAt) return 'already-requested' as const

    await tx.update(userProfiles)
      .set({ deletionRequestedAt: new Date(), updatedAt: new Date() })
      .where(eq(userProfiles.userId, session.user.id))
    return 'requested' as const
  })

  if (result === 'unavailable') return { ok: false as const, error: 'Esta cuenta no puede solicitar la eliminación.' }
  revalidatePath('/account')
  revalidatePath('/staff')
  revalidatePath('/admin')
  revalidatePath('/workspace')
  return { ok: true as const }
}

export async function cancelMyAccountDeletionRequest() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return { ok: false as const, error: 'No se pudo verificar la sesión.' }

  await db.update(userProfiles)
    .set({ deletionRequestedAt: null, updatedAt: new Date() })
    .where(and(
      eq(userProfiles.userId, session.user.id),
      inArray(userProfiles.role, ['customer', 'staff']),
      isNotNull(userProfiles.deletionRequestedAt),
    ))
  revalidatePath('/account')
  revalidatePath('/staff')
  revalidatePath('/admin')
  revalidatePath('/workspace')
  return { ok: true as const }
}

export async function getAccountDeletionRequests() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return []
  const [admin] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)
  if (admin?.role !== 'admin' || admin.status !== 'active') return []

  const requests = await db.select({
    userId: userProfiles.userId,
    role: userProfiles.role,
    name: user.name,
    email: user.email,
    submittedAt: userProfiles.deletionRequestedAt,
  })
    .from(userProfiles)
    .innerJoin(user, eq(userProfiles.userId, user.id))
    .where(and(
      isNotNull(userProfiles.deletionRequestedAt),
      inArray(userProfiles.role, ['customer', 'staff']),
    ))
    .orderBy(desc(userProfiles.deletionRequestedAt))

  return Promise.all(requests.map(async (request) => {
    const [work] = request.role === 'customer'
      ? await db.select({ count: count() }).from(clientServiceRequests).where(and(
          eq(clientServiceRequests.userId, request.userId),
          inArray(clientServiceRequests.status, ['requested', 'reviewing', 'confirmed']),
        ))
      : await db.select({ count: count() }).from(clientServiceRequests).where(and(
          eq(clientServiceRequests.assignedStaffUserId, request.userId),
          eq(clientServiceRequests.status, 'confirmed'),
        ))
    return {
      ...request,
      role: request.role as 'customer' | 'staff',
      submittedAt: request.submittedAt?.toISOString() ?? '',
      openWorkCount: Number(work?.count ?? 0),
    }
  }))
}

export async function cancelAccountDeletionForReview(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return { ok: false as const }
  const [admin] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (admin?.role !== 'admin' || admin.status !== 'active') return { ok: false as const }

  const parsedId = z.string().trim().min(1).max(128).safeParse(userId)
  if (!parsedId.success) return { ok: false as const }
  await db.update(userProfiles)
    .set({ deletionRequestedAt: null, updatedAt: new Date() })
    .where(and(
      eq(userProfiles.userId, parsedId.data),
      inArray(userProfiles.role, ['customer', 'staff']),
      isNotNull(userProfiles.deletionRequestedAt),
    ))
  revalidatePath('/admin')
  revalidatePath('/account')
  revalidatePath('/staff')
  return { ok: true as const }
}

export async function finalizeAccountDeletion(userId: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return { ok: false as const, reason: 'unauthorized' as const }
  const [admin] = await db.select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (admin?.role !== 'admin' || admin.status !== 'active') return { ok: false as const, reason: 'unauthorized' as const }

  const parsedId = z.string().trim().min(1).max(128).safeParse(userId)
  if (!parsedId.success || parsedId.data === session.user.id) return { ok: false as const, reason: 'unavailable' as const }

  let documentPathnames: string[] = []
  try {
    const result = await db.transaction(async (tx) => {
      const [profile] = await tx.select({ role: userProfiles.role, deletionRequestedAt: userProfiles.deletionRequestedAt })
        .from(userProfiles)
        .where(eq(userProfiles.userId, parsedId.data))
        .limit(1)
        .for('update')
      if ((profile?.role !== 'customer' && profile?.role !== 'staff') || !profile.deletionRequestedAt) {
        return { ok: false as const, reason: 'unavailable' as const }
      }

      const [targetUser] = await tx.select({ email: user.email }).from(user).where(eq(user.id, parsedId.data)).limit(1)
      if (!targetUser) return { ok: false as const, reason: 'unavailable' as const }

      const [work] = profile.role === 'customer'
        ? await tx.select({ count: count() }).from(clientServiceRequests).where(and(
            eq(clientServiceRequests.userId, parsedId.data),
            inArray(clientServiceRequests.status, ['requested', 'reviewing', 'confirmed']),
          ))
        : await tx.select({ count: count() }).from(clientServiceRequests).where(and(
            eq(clientServiceRequests.assignedStaffUserId, parsedId.data),
            eq(clientServiceRequests.status, 'confirmed'),
          ))
      if (Number(work?.count ?? 0) > 0) return { ok: false as const, reason: 'pending-work' as const }

      documentPathnames = (await tx.select({ pathname: staffDocuments.pathname })
        .from(staffDocuments)
        .where(eq(staffDocuments.userId, parsedId.data))).map((document) => document.pathname)

      if (profile.role === 'customer') {
        await tx.delete(clientServiceRequests).where(eq(clientServiceRequests.userId, parsedId.data))
      } else {
        await tx.update(clientServiceRequests)
          .set({ assignedStaffUserId: null })
          .where(eq(clientServiceRequests.assignedStaffUserId, parsedId.data))
      }

      await tx.delete(staffDocuments).where(eq(staffDocuments.userId, parsedId.data))
      await tx.delete(userProfiles).where(eq(userProfiles.userId, parsedId.data))
      await tx.delete(verification).where(eq(verification.identifier, targetUser.email))
      await tx.delete(user).where(eq(user.id, parsedId.data))
      return { ok: true as const, reason: 'deleted' as const }
    })

    if (!result.ok) return result
    if (documentPathnames.length) {
      try {
        await del(documentPathnames)
      } catch {
        console.error('[admin] Account deleted, but staff document cleanup failed')
      }
    }
    revalidatePath('/admin')
    revalidatePath('/account')
    revalidatePath('/staff')
    revalidatePath('/workspace')
    return { ok: true as const, reason: 'deleted' as const }
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown deletion error'
    console.error('[admin] Unable to finalize account deletion:', detail)
    return { ok: false as const, reason: 'error' as const }
  }
}

export async function getPendingStaffApplications() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return null

  const [admin] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (admin?.role !== 'admin' || admin.status !== 'active') return null

  const [applicants, unverifiedApplicants] = await Promise.all([
    db
      .select({
        userId: userProfiles.userId,
        name: user.name,
        email: user.email,
        phone: userProfiles.phone,
        address: userProfiles.streetAddress,
        postalCode: userProfiles.postalCode,
        city: userProfiles.city,
        nationality: userProfiles.nationality,
        residencePermitType: userProfiles.residencePermitType,
        residencePermitExpiry: userProfiles.residencePermitExpiry,
        profilePhotoPath: userProfiles.profilePhotoPath,
        workExperience: userProfiles.workExperience,
        submittedAt: userProfiles.createdAt,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(and(
        eq(userProfiles.role, 'staff'),
        eq(userProfiles.status, 'pending'),
        eq(user.emailVerified, true),
      ))
      .orderBy(userProfiles.createdAt),
    db
      .select({
        userId: userProfiles.userId,
        name: user.name,
        email: user.email,
        submittedAt: userProfiles.createdAt,
      })
      .from(userProfiles)
      .innerJoin(user, eq(userProfiles.userId, user.id))
      .where(and(
        eq(userProfiles.role, 'staff'),
        eq(userProfiles.status, 'pending'),
        eq(user.emailVerified, false),
      ))
      .orderBy(userProfiles.createdAt),
  ])

  if (applicants.length === 0) return { applicants: [], unverifiedApplicants }
  const documents = await db.select({
    id: staffDocuments.id,
    userId: staffDocuments.userId,
    type: staffDocuments.type,
    originalName: staffDocuments.originalName,
    createdAt: staffDocuments.createdAt,
  }).from(staffDocuments).where(inArray(staffDocuments.userId, applicants.map((applicant) => applicant.userId)))

  return {
    applicants: applicants.map((applicant) => ({
      ...applicant,
      documents: documents.filter((document) => document.userId === applicant.userId),
    })),
    unverifiedApplicants,
  }
}

export async function resendStaffVerification(userId: string) {
  const parsedId = z.string().uuid().safeParse(userId)
  if (!parsedId.success) return { ok: false as const, error: 'verificationSendFailed' as const }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) {
    return { ok: false as const, error: 'verificationSendFailed' as const }
  }

  const [admin] = await db
    .select({ role: userProfiles.role, status: userProfiles.status })
    .from(userProfiles)
    .where(eq(userProfiles.userId, session.user.id))
    .limit(1)

  if (admin?.role !== 'admin' || admin.status !== 'active') {
    return { ok: false as const, error: 'verificationSendFailed' as const }
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_EMAIL_DOMAIN) {
    return { ok: false as const, error: 'verificationEmailNotConfigured' as const }
  }

  const [candidate] = await db
    .select({ email: user.email })
    .from(userProfiles)
    .innerJoin(user, eq(userProfiles.userId, user.id))
    .where(and(
      eq(userProfiles.userId, parsedId.data),
      eq(userProfiles.role, 'staff'),
      eq(userProfiles.status, 'pending'),
      eq(user.emailVerified, false),
    ))
    .limit(1)

  if (!candidate) return { ok: false as const, error: 'verificationSendFailed' as const }

  try {
    await auth.api.sendVerificationEmail({
      body: { email: candidate.email, callbackURL: '/staff' },
      headers: await headers(),
    })
    revalidatePath('/admin')
    return { ok: true as const }
  } catch (error) {
    console.error('[admin] Unable to resend staff verification email', error)
    return { ok: false as const, error: 'verificationSendFailed' as const }
  }
}

const availabilityInputSchema = z.array(z.object({
  weekday: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})).max(7).refine((windows) => new Set(windows.map((window) => window.weekday)).size === windows.length)

function switzerlandToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

function switzerlandMinutesNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date())
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0)
  return hour * 60 + minute
}

function durationInMinutes(hours: number) {
  return Math.max(30, Math.ceil(hours * 2) * 30)
}

function minutesOfDay(timeValue: string) {
  const [hours, minutes] = timeValue.split(':').map(Number)
  return hours * 60 + minutes
}

function timeOfDay(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && startB < endA
}

async function getStaffScheduleSuggestions(staffUserId: string, availability: Array<{ weekday: number; startTime: string; endTime: string }>, hours: number, preferredDate: string | null, excludeRequestId: string) {
  const today = switzerlandToday()
  const booked = await db.select({ requestId: serviceScheduleProposals.requestId, date: serviceScheduleProposals.appointmentDate, start: serviceScheduleProposals.startTime, end: serviceScheduleProposals.endTime })
    .from(serviceScheduleProposals)
    .where(and(
      eq(serviceScheduleProposals.staffUserId, staffUserId),
      inArray(serviceScheduleProposals.status, ['proposed', 'client_accepted', 'approved']),
    ))
  const duration = durationInMinutes(hours)
  const startDate = preferredDate && preferredDate > today ? preferredDate : today
  const base = new Date(`${startDate}T12:00:00Z`)
  const suggestions: Array<{ appointmentDate: string; startTime: string; endTime: string }> = []

  for (let offset = 0; offset < 30 && suggestions.length < 8; offset += 1) {
    const date = new Date(base)
    date.setUTCDate(date.getUTCDate() + offset)
    const dateKey = date.toISOString().slice(0, 10)
    const weekday = ((date.getUTCDay() + 6) % 7) + 1
    for (const window of availability.filter((item) => item.weekday === weekday)) {
      const windowStart = minutesOfDay(window.startTime)
      const windowEnd = minutesOfDay(window.endTime)
      const earliestStart = Math.max(Math.ceil(windowStart / 30) * 30, dateKey === today ? Math.ceil(switzerlandMinutesNow() / 30) * 30 : 0)
      for (let start = earliestStart; start + duration <= windowEnd; start += 30) {
        const end = start + duration
        const collision = booked.some((slot) => slot.requestId !== excludeRequestId && slot.date === dateKey && overlaps(start, end, minutesOfDay(slot.start), minutesOfDay(slot.end)))
        if (!collision) suggestions.push({ appointmentDate: dateKey, startTime: timeOfDay(start), endTime: timeOfDay(end) })
        if (suggestions.length >= 8) break
      }
      if (suggestions.length >= 8) break
    }
  }
  return suggestions
}

export async function saveStaffWeeklyAvailability(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return { ok: false as const }
  const parsed = availabilityInputSchema.safeParse(input)
  if (!parsed.success || parsed.data.some((window) => window.startTime >= window.endTime)) return { ok: false as const }
  const saved = await db.transaction(async (tx) => {
    const [profile] = await tx.select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
      .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1).for('update')
    if (profile?.role !== 'staff' || profile.status !== 'active' || profile.deletionRequestedAt) return false
    await tx.delete(staffWeeklyAvailability).where(eq(staffWeeklyAvailability.userId, session.user.id))
    if (parsed.data.length) await tx.insert(staffWeeklyAvailability).values(parsed.data.map((window) => ({
      id: randomUUID(), userId: session.user.id, weekday: window.weekday,
      startTime: `${window.startTime}:00`, endTime: `${window.endTime}:00`, updatedAt: new Date(),
    })))
    return true
  })
  if (!saved) return { ok: false as const }
  revalidatePath('/staff')
  revalidatePath('/admin')
  return { ok: true as const }
}

export async function getStaffSchedulingData() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return { availability: [], requests: [] }
  const [profile] = await db.select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
    .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (profile?.role !== 'staff' || profile.status !== 'active' || profile.deletionRequestedAt) return { availability: [], requests: [] }

  const availability = await db.select({ id: staffWeeklyAvailability.id, weekday: staffWeeklyAvailability.weekday, startTime: staffWeeklyAvailability.startTime, endTime: staffWeeklyAvailability.endTime })
    .from(staffWeeklyAvailability).where(eq(staffWeeklyAvailability.userId, session.user.id)).orderBy(staffWeeklyAvailability.weekday)
  const requests = await db.select({
    id: clientServiceRequests.id, serviceType: clientServiceRequests.serviceType, surfaceArea: clientServiceRequests.surfaceArea,
    estimatedHours: clientServiceRequests.estimatedHours, preferredDate: clientServiceRequests.preferredDate,
    proposalDate: serviceScheduleProposals.appointmentDate, proposalStartTime: serviceScheduleProposals.startTime,
    proposalEndTime: serviceScheduleProposals.endTime, proposalStatus: serviceScheduleProposals.status,
  }).from(clientServiceRequests)
    .leftJoin(serviceScheduleProposals, eq(clientServiceRequests.id, serviceScheduleProposals.requestId))
    .where(and(eq(clientServiceRequests.assignedStaffUserId, session.user.id), eq(clientServiceRequests.status, 'reviewing')))
    .orderBy(desc(clientServiceRequests.createdAt))

  return {
    availability: availability.map((window) => ({ ...window, startTime: window.startTime.slice(0, 5), endTime: window.endTime.slice(0, 5) })),
    requests: await Promise.all(requests.map(async (request) => ({
      ...request,
      suggestions: request.proposalStatus === 'client_accepted' || request.proposalStatus === 'approved' ? [] : await getStaffScheduleSuggestions(
        session.user.id, availability.map((window) => ({ weekday: window.weekday, startTime: window.startTime, endTime: window.endTime })),
        request.estimatedHours, request.preferredDate, request.id,
      ),
    }))),
  }
}

export async function assignStaffToServiceRequest(requestId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const [admin] = await db.select({ role: userProfiles.role, status: userProfiles.status }).from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (admin?.role !== 'admin' || admin.status !== 'active') return
  const parsedId = z.string().uuid().safeParse(requestId)
  const staffId = z.string().min(1).max(128).safeParse(formData.get('assignedStaffUserId'))
  if (!parsedId.success || !staffId.success) return

  const assigned = await db.transaction(async (tx) => {
    const [request] = await tx.select({ staffUserId: clientServiceRequests.assignedStaffUserId }).from(clientServiceRequests)
      .where(and(eq(clientServiceRequests.id, parsedId.data), eq(clientServiceRequests.status, 'reviewing'))).limit(1).for('update')
    if (!request) return false
    const [staffMember] = await tx.select({ userId: userProfiles.userId }).from(userProfiles).innerJoin(user, eq(userProfiles.userId, user.id))
      .where(and(eq(userProfiles.userId, staffId.data), eq(userProfiles.role, 'staff'), eq(userProfiles.status, 'active'), isNull(userProfiles.deletionRequestedAt), eq(user.emailVerified, true)))
      .limit(1)
    if (!staffMember) return false
    const [updated] = await tx.update(clientServiceRequests).set({ assignedStaffUserId: staffId.data })
      .where(and(eq(clientServiceRequests.id, parsedId.data), eq(clientServiceRequests.status, 'reviewing'))).returning({ id: clientServiceRequests.id })
    if (!updated) return false
    if (request.staffUserId && request.staffUserId !== staffId.data) await tx.update(serviceScheduleProposals)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(and(eq(serviceScheduleProposals.requestId, parsedId.data), inArray(serviceScheduleProposals.status, ['proposed', 'client_accepted'])))
    return true
  })
  if (!assigned) return
  revalidatePath('/admin')
  revalidatePath('/staff')
  revalidatePath('/account')
  revalidatePath('/workspace')
}

export async function proposeStaffSchedule(requestId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const [profile] = await db.select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt }).from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (profile?.role !== 'staff' || profile.status !== 'active' || profile.deletionRequestedAt) return
  const parsedId = z.string().uuid().safeParse(requestId)
  const date = z.string().date().safeParse(formData.get('appointmentDate'))
  const startTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).safeParse(formData.get('startTime'))
  if (!parsedId.success || !date.success || !startTime.success || date.data < switzerlandToday()) return

  await db.transaction(async (tx) => {
    const [request] = await tx.select({ hours: clientServiceRequests.estimatedHours, staffId: clientServiceRequests.assignedStaffUserId, status: clientServiceRequests.status })
      .from(clientServiceRequests).where(and(eq(clientServiceRequests.id, parsedId.data), eq(clientServiceRequests.assignedStaffUserId, session.user.id))).limit(1).for('update')
    if (!request || request.staffId !== session.user.id || request.status !== 'reviewing') return
    const [lockedProfile] = await tx.select({ role: userProfiles.role, status: userProfiles.status, deletionRequestedAt: userProfiles.deletionRequestedAt })
      .from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1).for('update')
    if (lockedProfile?.role !== 'staff' || lockedProfile.status !== 'active' || lockedProfile.deletionRequestedAt) return
    const duration = durationInMinutes(request.hours)
    const start = minutesOfDay(startTime.data)
    const end = start + duration
    if (end > 1440 || (date.data === switzerlandToday() && start < switzerlandMinutesNow())) return
    const weekday = ((new Date(`${date.data}T12:00:00Z`).getUTCDay() + 6) % 7) + 1
    const [window] = await tx.select().from(staffWeeklyAvailability).where(and(eq(staffWeeklyAvailability.userId, session.user.id), eq(staffWeeklyAvailability.weekday, weekday))).limit(1)
    if (!window || start < minutesOfDay(window.startTime) || end > minutesOfDay(window.endTime)) return
    const dateSlots = await tx.select({ requestId: serviceScheduleProposals.requestId, start: serviceScheduleProposals.startTime, end: serviceScheduleProposals.endTime })
      .from(serviceScheduleProposals).where(and(eq(serviceScheduleProposals.staffUserId, session.user.id), eq(serviceScheduleProposals.appointmentDate, date.data), inArray(serviceScheduleProposals.status, ['proposed', 'client_accepted', 'approved'])))
    if (dateSlots.some((slot) => slot.requestId !== parsedId.data && overlaps(start, end, minutesOfDay(slot.start), minutesOfDay(slot.end)))) return
    await tx.insert(serviceScheduleProposals).values({
      id: randomUUID(), requestId: parsedId.data, staffUserId: session.user.id,
      appointmentDate: date.data, startTime: `${timeOfDay(start)}:00`, endTime: `${timeOfDay(end)}:00`, status: 'proposed', updatedAt: new Date(),
    }).onConflictDoUpdate({ target: serviceScheduleProposals.requestId, set: {
      staffUserId: session.user.id, appointmentDate: date.data, startTime: `${timeOfDay(start)}:00`,
      endTime: `${timeOfDay(end)}:00`, status: 'proposed', clientRespondedAt: null, adminApprovedAt: null,
      approvedBy: null, updatedAt: new Date(),
    } })
  })
  revalidatePath('/staff')
  revalidatePath('/account')
  revalidatePath('/admin')
  revalidatePath('/workspace')
}

export async function respondToScheduleProposal(requestId: string, response: 'accept' | 'decline') {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const [profile] = await db.select({ role: userProfiles.role, status: userProfiles.status }).from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (profile?.role !== 'customer' || profile.status !== 'active') return
  const parsedId = z.string().uuid().safeParse(requestId)
  const parsedResponse = z.enum(['accept', 'decline']).safeParse(response)
  if (!parsedId.success || !parsedResponse.success) return
  await db.transaction(async (tx) => {
    const [request] = await tx.select({ assignedStaffUserId: clientServiceRequests.assignedStaffUserId }).from(clientServiceRequests)
      .where(and(eq(clientServiceRequests.id, parsedId.data), eq(clientServiceRequests.userId, session.user.id), eq(clientServiceRequests.status, 'reviewing'))).limit(1).for('update')
    if (!request) return
    const [proposal] = await tx.select().from(serviceScheduleProposals)
      .where(and(eq(serviceScheduleProposals.requestId, parsedId.data), eq(serviceScheduleProposals.status, 'proposed'))).limit(1).for('update')
    if (!proposal || request.assignedStaffUserId !== proposal.staffUserId) return
    if (parsedResponse.data === 'accept' && (proposal.appointmentDate < switzerlandToday() || (proposal.appointmentDate === switzerlandToday() && minutesOfDay(proposal.startTime) < switzerlandMinutesNow()))) return
    await tx.update(serviceScheduleProposals).set({
      status: parsedResponse.data === 'accept' ? 'client_accepted' : 'declined', clientRespondedAt: new Date(), updatedAt: new Date(),
    }).where(and(eq(serviceScheduleProposals.id, proposal.id), eq(serviceScheduleProposals.status, 'proposed')))
  })
  revalidatePath('/account')
  revalidatePath('/staff')
  revalidatePath('/admin')
  revalidatePath('/workspace')
}

export async function approveClientScheduleProposal(requestId: string, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !session.user.emailVerified) return
  const [admin] = await db.select({ role: userProfiles.role, status: userProfiles.status }).from(userProfiles).where(eq(userProfiles.userId, session.user.id)).limit(1)
  if (admin?.role !== 'admin' || admin.status !== 'active') return
  const parsedId = z.string().uuid().safeParse(requestId)
  const price = z.coerce.number().int().min(1).max(1000000).safeParse(formData.get('confirmedPrice'))
  if (!parsedId.success || !price.success) return

  const approved = await db.transaction(async (tx) => {
    const [request] = await tx.select({ status: clientServiceRequests.status, assignedStaffUserId: clientServiceRequests.assignedStaffUserId }).from(clientServiceRequests).where(eq(clientServiceRequests.id, parsedId.data)).limit(1).for('update')
    const [proposal] = await tx.select().from(serviceScheduleProposals).where(and(eq(serviceScheduleProposals.requestId, parsedId.data), eq(serviceScheduleProposals.status, 'client_accepted'))).limit(1).for('update')
    if (request?.status !== 'reviewing' || !proposal || request.assignedStaffUserId !== proposal.staffUserId) return false
    const [staffMember] = await tx.select({ userId: userProfiles.userId }).from(userProfiles).innerJoin(user, eq(userProfiles.userId, user.id)).where(and(
      eq(userProfiles.userId, proposal.staffUserId), eq(userProfiles.role, 'staff'), eq(userProfiles.status, 'active'),
      isNull(userProfiles.deletionRequestedAt), eq(user.emailVerified, true),
    )).limit(1).for('update')
    if (!staffMember) return false
    const proposalStart = minutesOfDay(proposal.startTime)
    const proposalEnd = minutesOfDay(proposal.endTime)
    if (proposal.appointmentDate < switzerlandToday() || (proposal.appointmentDate === switzerlandToday() && proposalStart < switzerlandMinutesNow())) return false
    const weekday = ((new Date(`${proposal.appointmentDate}T12:00:00Z`).getUTCDay() + 6) % 7) + 1
    const [availability] = await tx.select().from(staffWeeklyAvailability).where(and(
      eq(staffWeeklyAvailability.userId, proposal.staffUserId), eq(staffWeeklyAvailability.weekday, weekday),
    )).limit(1)
    if (!availability || proposalStart < minutesOfDay(availability.startTime) || proposalEnd > minutesOfDay(availability.endTime)) return false
    const otherSlots = await tx.select({ id: serviceScheduleProposals.id, start: serviceScheduleProposals.startTime, end: serviceScheduleProposals.endTime })
      .from(serviceScheduleProposals).where(and(
        eq(serviceScheduleProposals.staffUserId, proposal.staffUserId), eq(serviceScheduleProposals.appointmentDate, proposal.appointmentDate),
        inArray(serviceScheduleProposals.status, ['proposed', 'client_accepted', 'approved']),
      ))
    if (otherSlots.some((slot) => slot.id !== proposal.id && overlaps(proposalStart, proposalEnd, minutesOfDay(slot.start), minutesOfDay(slot.end)))) return false
    const [updated] = await tx.update(serviceScheduleProposals).set({ status: 'approved', adminApprovedAt: new Date(), approvedBy: session.user.id, updatedAt: new Date() })
      .where(and(eq(serviceScheduleProposals.id, proposal.id), eq(serviceScheduleProposals.status, 'client_accepted'))).returning({ id: serviceScheduleProposals.id })
    if (!updated) return false
    await tx.update(clientServiceRequests).set({ status: 'confirmed', confirmedDate: proposal.appointmentDate, confirmedPrice: price.data })
      .where(and(eq(clientServiceRequests.id, parsedId.data), eq(clientServiceRequests.status, 'reviewing')))
    return true
  })
  if (!approved) return
  revalidatePath('/admin')
  revalidatePath('/staff')
  revalidatePath('/account')
  revalidatePath('/workspace')
}

