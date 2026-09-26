import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const developmentOrigins = [
  'http://localhost:3000',
  ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
  ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
  ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
  ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
]

const productionOrigins = [
  ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ...(process.env.VERCEL_PROJECT_PRODUCTION_URL ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`] : []),
  'https://hs-cleaning.ch',
  'https://www.hs-cleaning.ch',
  'https://hs-sarl.ch',
  'https://www.hs-sarl.ch',
]

export const auth = betterAuth({
  // Role is persisted in the Neon user table and assigned server-side during sign-up.
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL),
  emailAndPassword: { enabled: true, autoSignIn: true },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'USER',
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.email.trim().toLowerCase() === 'h.squalityserservice@gmail.com') {
            return { data: { ...user, role: 'ADMIN' } }
          }
          return { data: { ...user, role: 'USER' } }
        },
      },
    },
  },
  trustedOrigins: process.env.NODE_ENV === 'development' ? [...developmentOrigins, ...productionOrigins] : productionOrigins,
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  ...(process.env.NODE_ENV === 'development' ? {
    advanced: {
      defaultCookieAttributes: { sameSite: 'none' as const, secure: true },
    },
  } : {}),
})
