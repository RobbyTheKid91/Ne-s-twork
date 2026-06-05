'use client'

import Image from 'next/image'

export type Listing = {
  id: string
  kind: 'search' | 'offer'
  housing_type: 'whole' | 'wg_room' | 'sublet'
  size: number
  price: number
  status: 'active' | 'paused' | 'taken'
  duration_from?: string | null
  duration_to?: string | null
  districts?: string[] | null
}

export type NetworkEntry = {
  profile_id: string
  level: 1 | 2
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
  via_first_name: string | null
  via_last_name: string | null
  listings: Listing[]
  isMatch?: boolean
}

const HOUSING_LABELS: Record<string, string> = {
  whole: 'Ganze Wohnung',
  wg_room: 'WG-Zimmer',
  sublet: 'Zwischenmiete',
}

function Avatar({ firstName, avatarUrl }: { firstName: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={firstName}
        width={40}
        height={40}
        className="rounded-full object-cover w-10 h-10"
      />
    )
  }
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
      aria-hidden="true"
    >
      {firstName[0]}
    </div>
  )
}

function ListingPill({ listing }: { listing: Listing }) {
  const isOffer = listing.kind === 'offer'
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs space-y-0.5"
      style={{
        backgroundColor: isOffer ? '#F0FDF4' : '#EFF6FF',
        borderLeft: `3px solid ${isOffer ? '#16A34A' : '#2563EB'}`,
      }}
    >
      <div className="font-medium" style={{ color: isOffer ? '#15803D' : '#1D4ED8' }}>
        {isOffer ? 'Angebot' : 'Gesuch'} · {HOUSING_LABELS[listing.housing_type]}
      </div>
      <div className="text-gray-500">
        {listing.size} m² · {listing.price.toLocaleString('de-DE')} €
        {listing.housing_type === 'sublet' && listing.duration_from && listing.duration_to && (
          <> · {new Date(listing.duration_from).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })} – {new Date(listing.duration_to).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}</>
        )}
        {listing.districts && listing.districts.length > 0 && (
          <> · {listing.districts.join(', ')}</>
        )}
      </div>
    </div>
  )
}

export function NetworkCard({ entry }: { entry: NetworkEntry }) {
  const isAnon = entry.level === 2
  const displayName = isAnon
    ? `Kontakt von ${entry.via_first_name ?? '?'} ${entry.via_last_name ?? '?'}`
    : `${entry.first_name} ${entry.last_name}`

  return (
    <div
      className="bg-white rounded-2xl p-4 space-y-3 relative"
      style={{
        border: entry.isMatch ? '1.5px solid #6B3CF6' : '1px solid #E5E7EB',
        boxShadow: entry.isMatch ? '0 0 0 3px #EDE9FE' : undefined,
      }}
    >
      {entry.isMatch && (
        <div
          className="absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: '#6B3CF6', color: '#FFFFFF' }}
        >
          Match ✓
        </div>
      )}

      <div className="flex items-center gap-3">
        {isAnon ? (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#F3F4F6' }}
            aria-hidden="true"
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        ) : (
          <Avatar firstName={entry.first_name!} avatarUrl={entry.avatar_url} />
        )}

        <div className="min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {displayName}
          </p>
          {!isAnon && entry.email && (
            <a
              href={`mailto:${entry.email}`}
              className="text-xs text-gray-400 hover:underline truncate block"
            >
              {entry.email}
            </a>
          )}
          {isAnon && (
            <p className="text-xs text-gray-400">Anonymes Profil · Ebene 2</p>
          )}
        </div>
      </div>

      {entry.listings.length > 0 && (
        <div className="space-y-2">
          {entry.listings.map(l => (
            <ListingPill key={l.id} listing={l} />
          ))}
        </div>
      )}

      {entry.listings.length === 0 && (
        <p className="text-xs text-gray-400">Kein aktives Gesuch oder Angebot</p>
      )}
    </div>
  )
}
