import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool }

function getDatabaseConnectionString() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return connectionString

  const databaseUrl = new URL(connectionString)
  const sslMode = databaseUrl.searchParams.get('sslmode')
  if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
    databaseUrl.searchParams.set('sslmode', 'verify-full')
  }

  return databaseUrl.toString()
}

export const pool = globalForDb.pgPool ?? new Pool({
  connectionString: getDatabaseConnectionString(),
  max: 5,
})

if (process.env.NODE_ENV !== 'production') globalForDb.pgPool = pool

export const db = drizzle(pool, { schema })

