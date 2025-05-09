import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use ReturnType to infer the correct type from the cookies function
type CookieStore = ReturnType<typeof cookies>

export function createClient() {
  const cookieStore: CookieStore = cookies() // Apply the inferred type

  // Create a server's supabase client with cookies
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-expect-error Linter incorrectly infers cookieStore as Promise here
          return cookieStore.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string, _options: CookieOptions) {
          // Server Components cannot set cookies. This is client-only for server actions/route handlers.
          // However, the type signature requires the method.
          // cookieStore.set({ name, value, ...options }) // This would throw error
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string, _options: CookieOptions) {
          // Server Components cannot remove cookies. This is client-only for server actions/route handlers.
          // However, the type signature requires the method.
          // cookieStore.delete({ name, ...options }) // This would throw error
        },
      },
    }
  )
} 