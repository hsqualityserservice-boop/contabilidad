import { NextResponse, type NextRequest } from 'next/server'

const legacyCookieNames = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  'authjs.session-token',
  '__Secure-authjs.session-token',
]

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  for (const name of legacyCookieNames) {
    if (request.cookies.has(name)) {
      response.cookies.set(name, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
      })
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|locales|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
