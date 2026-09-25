import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const rawDatabaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
const databaseUrl = rawDatabaseUrl
  ? rawDatabaseUrl.includes('sslmode=')
    ? rawDatabaseUrl
    : `${rawDatabaseUrl}${rawDatabaseUrl.includes('?') ? '&' : '?'}sslmode=require`
  : undefined

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})
export const db = drizzle(pool, { schema })
