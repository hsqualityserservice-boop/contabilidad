import { headers } from 'next/headers'
import { pool } from '@/lib/db'
import crypto from 'crypto'

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'setup-ch-2024'

// Hash password using bcrypt-like approach (Better Auth compatible)
async function hashPassword(password: string): Promise<string> {
  // For production, this should use bcrypt. For now using a simple approach.
  // Better Auth stores passwords using argon2 typically, but we'll use Node's crypto
  const salt = crypto.randomBytes(16)
  const iterations = 100000
  const keylen = 64
  const digest = 'sha256'
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)
  return `${hash.toString('hex')}:${salt.toString('hex')}`
}

const users = [
  {
    email: 'h.squalityserservice@gmail.com',
    password: '137367Yanira05@A',
    name: 'Administrator H&S',
    role: 'ADMIN',
  },
  {
    email: 'h.squalityservice@gmail.com',
    password: '137367Yanira05@S',
    name: 'Staff Collaborator',
    role: 'STAFF',
  },
  {
    email: 'rhur.91@gmail.com',
    password: '137367Yanira05@C',
    name: 'Client Premium',
    role: 'CLIENT',
  },
]

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const secret = headersList.get('x-setup-secret')

    if (secret !== SETUP_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = []

    for (const user of users) {
      let client
      try {
        client = await pool.connect()
        console.log(`[v0] Creating user: ${user.email} with role ${user.role}...`)

        // Check if user already exists
        const existing = await client.query('SELECT id FROM "user" WHERE email = $1', [user.email])

        if (existing.rows.length > 0) {
          console.log(`[v0] ⚠ User already exists: ${user.email}`)
          results.push({
            email: user.email,
            status: 'already_exists',
            message: 'User already exists',
            role: user.role,
          })
          continue
        }

        // Create user with hashed password
        const userId = crypto.randomUUID()
        const hashedPassword = await hashPassword(user.password)

        const query = `
          INSERT INTO "user" (id, email, name, password, role, "emailVerified", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, email, role
        `

        const result = await client.query(query, [
          userId,
          user.email,
          user.name,
          hashedPassword,
          user.role,
          new Date(), // emailVerified
          new Date(), // createdAt
        ])

        if (result.rows.length > 0) {
          console.log(`[v0] ✓ User created: ${user.email} with role ${user.role}`)
          results.push({
            email: user.email,
            status: 'created',
            role: user.role,
            userId: result.rows[0].id,
          })
        }
      } catch (error: any) {
        console.error(`[v0] ✗ Error creating user ${user.email}:`, error?.message)
        results.push({
          email: user.email,
          status: 'error',
          message: error?.message || 'Unknown error',
          role: user.role,
        })
      } finally {
        if (client) {
          client.release()
        }
      }
    }

    return Response.json({ success: true, results }, { status: 200 })
  } catch (error) {
    console.error('[v0] Setup error:', error)
    return Response.json({ error: 'Setup failed', details: String(error) }, { status: 500 })
  }
}
