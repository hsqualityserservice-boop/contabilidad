import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

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
  userId: text('userId').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull(), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt').defaultNow(), updatedAt: timestamp('updatedAt').defaultNow(),
})

export const dashboardProfile = pgTable('dashboard_profile', { id: integer('id').primaryKey().generatedAlwaysAsIdentity(), userId: text('userId').notNull(), locale: text('locale').notNull().default('ES') })

export const dashboardCar = pgTable('dashboard_car', { id: text('id').primaryKey(), userId: text('userId').notNull(), plate: text('plate').notNull(), model: text('model').notNull(), status: text('status').notNull().default('available'), odometer: integer('odometer').notNull().default(0), imageUrl: text('image_url'), createdAt: timestamp('created_at').notNull().defaultNow() })
export const dashboardFuel = pgTable('dashboard_fuel', { id: text('id').primaryKey(), userId: text('userId').notNull(), carId: text('car_id').notNull(), date: timestamp('date').notNull(), cost: text('cost').notNull(), liters: text('liters').notNull(), odometer: integer('odometer').notNull() })
export const dashboardBooking = pgTable('dashboard_booking', { id: text('id').primaryKey(), userId: text('userId').notNull(), room: text('room').notNull(), customer: text('customer').notNull(), startsAt: timestamp('starts_at').notNull(), endsAt: timestamp('ends_at').notNull(), price: text('price').notNull(), paid: text('paid').notNull().default('0'), surcharge: text('surcharge').notNull().default('0') })
export const dashboardDocument = pgTable('dashboard_document', { id: text('id').primaryKey(), userId: text('userId').notNull(), name: text('name').notNull(), pathname: text('pathname').notNull(), contentType: text('content_type').notNull(), size: integer('size').notNull(), createdAt: timestamp('created_at').notNull().defaultNow() })

// Fleet Management: Documentos de vehículos (seguros, registros, etc.)
export const fleetVehicleDocument = pgTable('fleet_vehicle_document', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  category: text('category').notNull(), // 'insurance', 'inspection', 'registration', 'repair_record'
  name: text('name').notNull(),
  pathname: text('pathname').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Fleet Management: Mantenimiento y reparaciones
export const fleetMaintenance = pgTable('fleet_maintenance', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  date: timestamp('date').notNull(),
  type: text('type').notNull(), // 'oil', 'brakes', 'tires', 'general'
  description: text('description').notNull(),
  partsCost: text('parts_cost').notNull().default('0'),
  laborCost: text('labor_cost').notNull().default('0'),
  odometer: integer('odometer').notNull(),
  workshopName: text('workshop_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Fleet Management: Multas y sanciones
export const fleetFine = pgTable('fleet_fine', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  date: timestamp('date').notNull(),
  reference: text('reference').notNull(),
  description: text('description').notNull(),
  amount: text('amount').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'disputed'
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Operations: Eventos y trabajos
export const operationsEvent = pgTable('operations_event', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  vehicleId: text('vehicle_id'), // Opcional, puede ser sin vehículo
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at').notNull(),
  type: text('type').notNull(), // 'rental', 'maintenance', 'inspection', 'delivery'
  title: text('title').notNull(),
  description: text('description'),
  assignedTo: text('assigned_to'), // Nombre del personal
  cost: text('cost').notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Corporate: Documentación corporativa
export const corporateDocument = pgTable('corporate_document', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  category: text('category').notNull(), // 'contracts', 'tax', 'warranties', 'policies'
  name: text('name').notNull(),
  pathname: text('pathname').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Brand Settings: Configuración de marca por usuario
export const brandSettings = pgTable('brand_settings', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('userId').notNull().unique(),
  companyName: text('company_name').notNull().default('H&S Quality Service'),
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').notNull().default('#12243D'),
  accentColor: text('accent_color').notNull().default('#20B8AE'),
  surfaceColor: text('surface_color').notNull().default('#F5F7FA'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
