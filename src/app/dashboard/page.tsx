import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { NetworkCard, type NetworkEntry, type Listing } from './NetworkCard'
import { InviteLink } from './InviteLink'
import { OwnListings } from '@/components/OwnListings'

function isMatch(search: Listing, offer: Listing): boolean {
  if (search.housing_type !== offer.housing_type) return false
  if (offer.price > search.price) return false
  if (offer.size < search.size) return false
  if (offer.housing_type === 'sublet') {
    if (!search.duration_from || !search.duration_to || !offer.duration_from || !offer.duration_to) return false
    if (new Date(offer.duration_from) > new Date(search.duration_to) || new Date(offer.duration_to) < new Date(search.duration_from)) return false
  }
  if (offer.districts && offer.districts.length > 0) {
    if (!search.districts || search.districts.length === 0) return false
    if (!offer.districts.some(d => search.districts!.includes(d))) return false
  }
  return true
}

function NetworkSkeleton() {
  return (
    <section>
      <div className="h-3 w-24 rounded-lg bg-gray-100 animate-pulse mb-3" />
      <div className="space-y-3">
        <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    </section>
  )
}

async function NetworkSection({
  ownListings,
  inviteToken,
}: {
  ownListings: Listing[]
  inviteToken?: string
}) {
  const supabase = await createClient()
  const { data: networkRaw } = await supabase.rpc('get_my_network')

  const network: NetworkEntry[] = (networkRaw ?? []).map((row: Record<string, unknown>) => ({
    profile_id: row.profile_id as string,
    level: row.level as 1 | 2,
    first_name: row.first_name as string | null,
    last_name: row.last_name as string | null,
    email: row.email as string | null,
    avatar_url: row.avatar_url as string | null,
    via_first_name: row.via_first_name as string | null,
    via_last_name: row.via_last_name as string | null,
    listings: (row.listings as Listing[] | null) ?? [],
  }))

  const activeOwn = ownListings.filter(l => l.status === 'active')
  const mySearches = activeOwn.filter(l => l.kind === 'search')
  const myOffers = activeOwn.filter(l => l.kind === 'offer')

  const networkWithMatches: NetworkEntry[] = network.map(entry => {
    const networkOffers = entry.listings.filter(l => l.kind === 'offer')
    const networkSearches = entry.listings.filter(l => l.kind === 'search')
    const matched =
      mySearches.some(s => networkOffers.some(o => isMatch(s, o))) ||
      myOffers.some(o => networkSearches.some(s => isMatch(s, o)))
    return { ...entry, isMatch: matched }
  })

  const hasNetwork = networkWithMatches.length > 0

  return (
    <section>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        Dein Netzwerk
        {hasNetwork && (
          <span className="ml-2 text-gray-300 normal-case font-normal">
            {networkWithMatches.length} {networkWithMatches.length === 1 ? 'Person' : 'Personen'}
          </span>
        )}
      </p>

      {hasNetwork ? (
        <div className="space-y-3">
          {networkWithMatches
            .sort((a, b) => (b.isMatch ? 1 : 0) - (a.isMatch ? 1 : 0))
            .map(entry => (
              <NetworkCard key={entry.profile_id} entry={entry} />
            ))
          }
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: '#F3EFFE' }}
            aria-hidden="true"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#6B3CF6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Dein Netzwerk ist noch leer</p>
            <p className="text-xs text-gray-400 mt-1">
              Lad deine ersten Kontakte ein — Nestwork funktioniert nur wenn dein Netzwerk dabei ist.
            </p>
          </div>
          {inviteToken && (
            <div className="flex justify-center">
              <InviteLink token={inviteToken} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, avatar_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const [{ data: invite }, { data: ownListings }] = await Promise.all([
    supabase.from('invites').select('token').eq('owner_id', user.id).single(),
    supabase.from('listings')
      .select('id, kind, housing_type, size, price, status, duration_from, duration_to, districts')
      .eq('user_id', user.id)
      .in('status', ['active', 'paused']),
  ])

  const listings = (ownListings ?? []) as Listing[]

  return (
    <main className="min-h-screen bg-base pb-12" style={{ maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: '#6B3CF6' }}>Nestwork</h1>
        {invite?.token && <InviteLink token={invite.token} />}
      </div>

      <div className="px-4 pt-5 space-y-6">

        {/* Eigenes Profil-Snippet */}
        <section>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Dein Profil</p>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.first_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
                  aria-hidden="true"
                >
                  {profile.first_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  {profile.first_name} {profile.last_name}
                </p>
                <p className="text-xs text-gray-400">{profile.email}</p>
              </div>
              <Link
                href="/profile"
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                aria-label="Profil bearbeiten"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </Link>
            </div>

            <OwnListings listings={listings} />
          </div>
        </section>

        {/* Netzwerk — streamt separat rein */}
        <Suspense fallback={<NetworkSkeleton />}>
          <NetworkSection ownListings={listings} inviteToken={invite?.token} />
        </Suspense>

      </div>
    </main>
  )
}
