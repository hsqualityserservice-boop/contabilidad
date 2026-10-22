export const INITIAL_ADMIN_EMAIL = 'h.squalityserservice@gmail.com'

export function isInitialAdminEmail(email: string) {
  return email.trim().toLowerCase() === INITIAL_ADMIN_EMAIL
}
