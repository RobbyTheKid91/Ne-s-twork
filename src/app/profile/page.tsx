import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { OwnListings } from '@/components/OwnListings'
import { ProfileClient } from './ProfileClient'
import type { Listing } from '@/app/dashboard/NetworkCard'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: ownListings },
  ] = await Promise.all([
    supabase.from('profiles').select('first_name, last_name, email, avatar_url').eq('id', user.id).single(),
    supabase.from('listings')
      .select('id, kind, housing_type, size, price, status, duration_from, duration_to, districts')
      .eq('user_id', user.id)
      .in('status', ['active', 'paused']),
  ])

  if (!profile) redirect('/onboarding')

  return (
    <main className="min-h-screen bg-base pb-12" style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="Zurück zum Dashboard"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#6B3CF6' }}>Mein Profil</h1>
      </div>

      <div className="px-4 pt-5 space-y-6">

        {/* Profil bearbeiten */}
        <ProfileClient
          userId={user.id}
          firstName={profile.first_name}
          lastName={profile.last_name}
          email={profile.email}
          avatarUrl={profile.avatar_url ?? null}
        />

        {/* Eigene Listings */}
        <section>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Gesuch & Angebot</p>
          <OwnListings listings={(ownListings ?? []) as Listing[]} />
        </section>

      </div>
    </main>
  )
}
