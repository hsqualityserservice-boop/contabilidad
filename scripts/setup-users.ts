import { auth } from '@/lib/auth'

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

async function setupUsers() {
  console.log('[v0] Starting user setup for H&S Service Sàrl...')

  for (const user of users) {
    try {
      console.log(`[v0] Creating user: ${user.email} (${user.role})...`)
      const result = await auth.api.signUpEmail({
        email: user.email,
        password: user.password,
        name: user.name,
      })

      if (result?.user) {
        console.log(`[v0] ✓ User created: ${user.email} with role ${user.role}`)
      } else {
        console.log(`[v0] ⚠ User may already exist: ${user.email}`)
      }
    } catch (error: any) {
      if (error?.message?.includes('already exists')) {
        console.log(`[v0] ⚠ User already exists: ${user.email}`)
      } else {
        console.error(`[v0] ✗ Error creating user ${user.email}:`, error?.message || error)
      }
    }
  }

  console.log('[v0] User setup completed.')
}

setupUsers()
