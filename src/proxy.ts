import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  try {
    let response = supabaseResponse

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const protectedRoutes = ['/dashboard', '/onboarding', '/profile']
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if ((pathname === '/login' || pathname === '/') && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch {
    return supabaseResponse
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)'],
}
