import { pgTable, text, timestamp, boolean, integer, real, doublePrecision, date, time, jsonb } from 'drizzle-orm/pg-core'
import type { ClientQuoteDetails } from '@/lib/client-pricing'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const userProfiles = pgTable('user_profiles', {
  userId: text('userId').primaryKey().notNull(),
  role: text('role').$type<'customer' | 'staff' | 'admin'>().notNull(),
  status: text('status').$type<'pending' | 'active' | 'suspended'>().notNull(),
  accountType: text('accountType').$type<'private' | 'professional'>(),
  phone: text('phone').notNull(),
  streetAddress: text('streetAddress').notNull(),
  postalCode: text('postalCode').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull().default('CH'),
  companyName: text('companyName'),
  companyIde: text('companyIde'),
  nationality: text('nationality'),
  residencePermitType: text('residencePermitType'),
  residencePermitExpiry: date('residencePermitExpiry', { mode: 'string' }),
  profilePhotoPath: text('profilePhotoPath'),
  workExperience: text('workExperience'),
  deletionRequestedAt: timestamp('deletionRequestedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const staffInvites = pgTable('staff_invites', {
  id: text('id').primaryKey(),
  codeHash: text('codeHash').notNull().unique(),
  email: text('email').notNull(),
  createdBy: text('createdBy').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  redeemedAt: timestamp('redeemedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const staffDocuments = pgTable('staff_documents', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  type: text('type').$type<'profile_photo' | 'residence_permit' | 'cfc' | 'afp' | 'other'>().notNull(),
  pathname: text('pathname').notNull().unique(),
  originalName: text('originalName').notNull(),
  contentType: text('contentType').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const clientServiceRequests = pgTable('client_service_requests', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  serviceType: text('serviceType').$type<'prive_regular' | 'fin_de_bail' | 'fin_travaux' | 'bureaux' | 'cabinet_medical' | 'conciergerie' | 'airbnb'>().notNull(),
  canton: text('canton').$type<'GE' | 'VD' | 'FR' | 'NE' | 'VS'>().notNull(),
  postalCode: text('postalCode'),
  bathrooms: integer('bathrooms').notNull().default(1),
  surfaceArea: integer('surfaceArea').notNull(),
  windowArea: integer('windowArea').notNull().default(0),
  terraceArea: integer('terraceArea').notNull().default(0),
  includeOven: boolean('includeOven').notNull().default(false),
  includeFridge: boolean('includeFridge').notNull().default(false),
  includeWindows: boolean('includeWindows').notNull().default(false),
  includeTerrace: boolean('includeTerrace').notNull().default(false),
  quoteDetails: jsonb('quoteDetails').$type<ClientQuoteDetails>().notNull().default({} as ClientQuoteDetails),
  estimatedPrice: doublePrecision('estimatedPrice').notNull(),
  estimatedHours: real('estimatedHours').notNull(),
  crewSize: integer('crewSize').notNull(),
  preferredDate: date('preferredDate', { mode: 'string' }),
  confirmedDate: date('confirmedDate', { mode: 'string' }),
  confirmedPrice: integer('confirmedPrice'),
  assignedStaffUserId: text('assignedStaffUserId'),
  message: text('message'),
  status: text('status').$type<'requested' | 'reviewing' | 'confirmed' | 'completed' | 'cancelled'>().notNull().default('requested'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

//
// Add your app tables below. Always include a plain `userId` column so queries
// can be scoped per user — the security model depends on this column existing,
// not on a foreign key. Do NOT add a foreign key constraint
// (`.references(() => user.id, ...)`) unless the user explicitly asks for
// foreign keys or referential integrity; FK constraints make iterating on the
// schema harder.
//
// Example:
//
// import { serial } from "drizzle-orm/pg-core"
//
// export const todos = pgTable("todos", {
//   id: serial("id").primaryKey(),
//   userId: text("userId").notNull(),
//   title: text("title").notNull(),
//   completed: boolean("completed").notNull().default(false),
//   createdAt: timestamp("createdAt").notNull().defaultNow(),
// })
//
// If the user asks for foreign keys, add the reference back in:
//   userId: text("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),

export const staffWeeklyAvailability = pgTable('staff_weekly_availability', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  weekday: integer('weekday').notNull(),
  startTime: time('startTime').notNull(),
  endTime: time('endTime').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const serviceScheduleProposals = pgTable('service_schedule_proposals', {
  id: text('id').primaryKey(),
  requestId: text('requestId').notNull().unique(),
  staffUserId: text('staffUserId').notNull(),
  appointmentDate: date('appointmentDate', { mode: 'string' }).notNull(),
  startTime: time('startTime').notNull(),
  endTime: time('endTime').notNull(),
  status: text('status').$type<'proposed' | 'client_accepted' | 'approved' | 'declined' | 'cancelled'>().notNull().default('proposed'),
  clientRespondedAt: timestamp('clientRespondedAt'),
  adminApprovedAt: timestamp('adminApprovedAt'),
  approvedBy: text('approvedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
