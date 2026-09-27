import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const roleMap: Record<string, 'ADMIN' | 'STAFF' | 'CLIENT'> = {
  'h.squalityserservice@gmail.com': 'ADMIN',
  'h.squalityservice@gmail.com': 'STAFF',
  'rhur.91@gmail.com': 'CLIENT',
}

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL),
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', ...[process.env.V0_RUNTIME_URL, process.env.V0_DEV_APP_URL, process.env.V0_BUILD_URL, process.env.V0_SANDBOX_URL].filter(Boolean) as string[]] : []),
    ...(process.env.NODE_ENV === 'production' ? [process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`].filter(Boolean) as string[] : []),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const assignedRole = roleMap[user.email.toLowerCase()]
          if (assignedRole) {
            await pool.query('UPDATE "user" SET role = $1 WHERE id = $2', [assignedRole, user.id])
          }
        },
      },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === 'development' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
