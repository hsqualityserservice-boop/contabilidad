'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { dashboardCar, dashboardFuel, dashboardBooking, dashboardDocument } from '@/lib/db/schema'
import { eq, and, desc, lt, gt } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// CARS
export async function getCars() {
  const userId = await getUserId()
  return db.select().from(dashboardCar).where(eq(dashboardCar.userId, userId)).orderBy(desc(dashboardCar.createdAt))
}

export async function addCar(plate: string, model: string, imageUrl?: string) {
  const userId = await getUserId()
  if (!plate.trim() || !model.trim()) throw new Error('La matrícula y el modelo son obligatorios')
  const id = `car-${crypto.randomUUID()}`
  await db.insert(dashboardCar).values({ id, userId, plate: plate.trim().toUpperCase(), model: model.trim(), imageUrl: imageUrl || null, status: 'available', odometer: 0 })
  return id
}

export async function updateCarOdometer(carId: string, odometer: number) {
  const userId = await getUserId()
  await db.update(dashboardCar).set({ odometer }).where(and(eq(dashboardCar.id, carId), eq(dashboardCar.userId, userId)))
}

export async function updateCarStatus(carId: string, status: string) {
  const userId = await getUserId()
  await db.update(dashboardCar).set({ status }).where(and(eq(dashboardCar.id, carId), eq(dashboardCar.userId, userId)))
}

// FUEL
export async function addFuelRecord(carId: string, date: Date, cost: string, liters: string, odometer: number) {
  const userId = await getUserId()
  const id = `fuel-${Date.now()}`
  await db.insert(dashboardFuel).values({ id, userId, carId, date, cost, liters, odometer })
  await updateCarOdometer(carId, odometer)
  return id
}

export async function getFuelRecords() {
  const userId = await getUserId()
  return db.select().from(dashboardFuel).where(eq(dashboardFuel.userId, userId)).orderBy(desc(dashboardFuel.date))
}

// BOOKINGS
export async function addBooking(room: string, customer: string, startsAt: Date, endsAt: Date, price: string) {
  const userId = await getUserId()
  if (!room.trim() || !customer.trim() || startsAt >= endsAt || Number(price) <= 0) throw new Error('Revisa la sala, las fechas y el precio')
  const overlapping = await db.select({ id: dashboardBooking.id }).from(dashboardBooking).where(and(eq(dashboardBooking.userId, userId), eq(dashboardBooking.room, room), lt(dashboardBooking.startsAt, endsAt), gt(dashboardBooking.endsAt, startsAt)))
  if (overlapping.length > 0) throw new Error('La sala ya está reservada en ese horario')
  const id = `booking-${crypto.randomUUID()}`
  await db.insert(dashboardBooking).values({ id, userId, room: room.trim(), customer: customer.trim(), startsAt, endsAt, price, paid: '0', surcharge: '0' })
  return id
}

export async function getBookings() {
  const userId = await getUserId()
  return db.select().from(dashboardBooking).where(eq(dashboardBooking.userId, userId)).orderBy(desc(dashboardBooking.startsAt))
}

export async function updateBookingPayment(bookingId: string, paid: string, surcharge: string = '0') {
  const userId = await getUserId()
  await db.update(dashboardBooking).set({ paid, surcharge }).where(and(eq(dashboardBooking.id, bookingId), eq(dashboardBooking.userId, userId)))
}

// DOCUMENTS
export async function addDocument(name: string, pathname: string, contentType: string, size: number) {
  const userId = await getUserId()
  const id = `doc-${Date.now()}`
  await db.insert(dashboardDocument).values({ id, userId, name, pathname, contentType, size })
  return id
}

export async function getDocuments() {
  const userId = await getUserId()
  return db.select().from(dashboardDocument).where(eq(dashboardDocument.userId, userId)).orderBy(desc(dashboardDocument.createdAt))
}

export async function deleteDocument(docId: string) {
  const userId = await getUserId()
  await db.delete(dashboardDocument).where(and(eq(dashboardDocument.id, docId), eq(dashboardDocument.userId, userId)))
}
