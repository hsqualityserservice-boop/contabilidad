import { betterAuth } from 'better-auth'
import { Resend } from 'resend'
import { eq } from 'drizzle-orm'
import { db, pool } from '@/lib/db'
import { userProfiles } from '@/lib/db/schema'
import { INITIAL_ADMIN_EMAIL } from '@/lib/admin-bootstrap'

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!)
}

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url, token }) => {
      const resendApiKey = process.env.RESEND_API_KEY
      const senderDomain = process.env.RESEND_EMAIL_DOMAIN
      if (!resendApiKey || !senderDomain) {
        throw new Error('Password reset email is not configured')
      }

      const resend = new Resend(resendApiKey)
      const escapedUrl = escapeHtml(url)
      const { error } = await resend.emails.send(
        {
          from: `HS Quality Service <soporte@${senderDomain}>`,
          to: [user.email],
          subject: 'Restablece tu contraseña de HS Quality Service',
          html: `<p>Hola ${escapeHtml(user.name)},</p><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta.</p><p><a href="${escapedUrl}">Restablecer contraseña</a></p><p>Si no solicitaste este cambio, ignora este mensaje.</p>`,
          text: `Hola ${user.name}, restablece la contraseña de tu cuenta: ${url}\n\nSi no solicitaste este cambio, ignora este mensaje.`,
        },
        { idempotencyKey: `password-reset/${token}` },
      )

      if (error) {
        console.error('[auth] Unable to send password reset email', error.message)
        throw new Error('Unable to send password reset email')
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      const isInitialAdmin = user.email.trim().toLowerCase() === INITIAL_ADMIN_EMAIL
      const resendApiKey = process.env.RESEND_API_KEY
      const senderDomain = process.env.RESEND_EMAIL_DOMAIN
      if (!resendApiKey || !senderDomain) {
        throw new Error('Email verification is not configured')
      }

      const resend = new Resend(resendApiKey)
      const escapedUrl = escapeHtml(url)
      const { error } = await resend.emails.send(
        {
          from: `HS Quality Service <soporte@${senderDomain}>`,
          to: [user.email],
          subject: isInitialAdmin ? 'Confirma tu correo para activar la cuenta de administración' : 'Confirma tu correo para HS Quality Service',
          html: `<p>Hola ${escapeHtml(user.name)},</p><p>Confirma que controlas esta dirección de correo electrónico.</p><p><a href="${escapedUrl}">Confirmar correo</a></p><p>Si no creaste esta cuenta, ignora este mensaje.</p>`,
          text: `Hola ${user.name}, confirma que controlas esta dirección de correo electrónico: ${url}\n\nSi no creaste esta cuenta, ignora este mensaje.`,
        },
        { idempotencyKey: `verify-email/${token}` },
      )

      if (error) {
        console.error('[auth] Unable to send verification email', error.message)
        throw new Error('Unable to send verification email')
      }
    },
    afterEmailVerification: async (verifiedUser) => {
      if (verifiedUser.email.trim().toLowerCase() !== INITIAL_ADMIN_EMAIL) return

      await db
        .update(userProfiles)
        .set({ role: 'admin', status: 'active', updatedAt: new Date() })
        .where(eq(userProfiles.userId, verifiedUser.id))
    },
  },
  trustedOrigins: [
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:3000',
          ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
          ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
          ...(process.env.V0_BUILD_URL ? [process.env.V0_BUILD_URL] : []),
          ...(process.env.V0_SANDBOX_URL ? [process.env.V0_SANDBOX_URL] : []),
        ]
      : []),
    ...(process.env.NODE_ENV === 'production'
      ? [
          ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
          ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
            : []),
        ]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
