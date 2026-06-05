'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteListing, togglePauseListing } from '@/app/dashboard/actions'
import { AddListingSheet } from '@/app/dashboard/AddListingSheet'
import type { Listing } from '@/app/dashboard/NetworkCard'

const HOUSING_LABELS: Record<string, string> = {
  whole: 'Ganze Wohnung',
  wg_room: 'WG-Zimmer',
  sublet: 'Zwischenmiete',
}

type CardProps = {
  listing: Listing
  onDeleted: (id: string) => void
  onEdit: (listing: Listing) => void
}

function ListingCard({ listing, onDeleted, onEdit }: CardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [optimisticStatus, setOptimisticStatus] = useState<'active' | 'paused'>(
    listing.status as 'active' | 'paused'
  )

  const isOffer = listing.kind === 'offer'
  const isPaused = optimisticStatus === 'paused'

  const accentColor = isPaused ? '#9CA3AF' : isOffer ? '#16A34A' : '#2563EB'
  const bgColor = isPaused ? '#F9FAFB' : isOffer ? '#F0FDF4' : '#EFF6FF'
  const labelColor = isPaused ? '#6B7280' : isOffer ? '#15803D' : '#1D4ED8'

  function handlePause() {
    const next: 'active' | 'paused' = optimisticStatus === 'active' ? 'paused' : 'active'
    setOptimisticStatus(next)
    startTransition(async () => { await togglePauseListing(listing.id, optimisticStatus) })
  }

  function handleDelete() {
    onDeleted(listing.id)
    startTransition(async () => {
      await deleteListing(listing.id)
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-opacity"
      style={{
        backgroundColor: bgColor,
        borderColor: isPaused ? '#E5E7EB' : isOffer ? '#BBF7D0' : '#BFDBFE',
        opacity: isPending ? 0.75 : 1,
      }}
    >
      <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: accentColor, color: '#fff' }}
          >
            {isOffer ? 'Angebot' : 'Gesuch'}
          </span>
          <span className="text-sm font-medium text-gray-600">{HOUSING_LABELS[listing.housing_type]}</span>
        </div>
        {isPaused && <span className="text-xs text-gray-400 font-medium">Pausiert</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold" style={{ color: labelColor }}>{listing.size} m²</p>
          <p className="text-xs text-gray-400 mt-0.5">{isOffer ? 'Größe' : 'Mindestgröße'}</p>
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: labelColor }}>{listing.price.toLocaleString('de-DE')} €</p>
          <p className="text-xs text-gray-400 mt-0.5">{isOffer ? 'Warmmiete' : 'Max. Budget'}</p>
        </div>
      </div>

      {listing.housing_type === 'sublet' && listing.duration_from && listing.duration_to && (
        <p className="text-xs text-gray-500">
          {new Date(listing.duration_from).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
          {' – '}
          {new Date(listing.duration_to).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}

      {listing.districts && listing.districts.length > 0 && (
        <p className="text-xs text-gray-500">
          Berlin · {listing.districts.join(', ')}
        </p>
      )}

      {confirmDelete ? (
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-sm text-gray-700 font-medium">Wirklich löschen?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-xl text-sm text-gray-600 bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-1.5 rounded-xl text-sm text-white cursor-pointer transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#EF4444' }}
            >
              Löschen
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handlePause}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all disabled:opacity-40"
            style={{ borderColor: '#E5E7EB', color: '#4B5563', backgroundColor: '#FFFFFF' }}
          >
            {isPaused ? '▶ Reaktivieren' : '⏸ Pausieren'}
          </button>
          <button
            onClick={() => onEdit(listing)}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all disabled:opacity-40"
            style={{ borderColor: '#C4B5FD', color: '#6B3CF6', backgroundColor: '#F5F3FF' }}
          >
            Bearbeiten
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl text-sm font-medium border cursor-pointer transition-all disabled:opacity-40"
            style={{ borderColor: '#FCA5A5', color: '#EF4444', backgroundColor: '#FFF5F5' }}
          >
            Löschen
          </button>
        </div>
      )}
      </div>
    </div>
  )
}

function AddCard({ kind, onClick }: { kind: 'search' | 'offer'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border-2 border-dashed p-4 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50"
      style={{ borderColor: '#D1D5DB', color: '#6B7280' }}
    >
      <span className="text-lg leading-none">+</span>
      {kind === 'offer' ? 'Angebot hinzufügen' : 'Gesuch hinzufügen'}
    </button>
  )
}

type SheetState =
  | { mode: 'add'; kind: 'search' | 'offer' }
  | { mode: 'edit'; listing: Listing }
  | null

type Props = {
  listings: Listing[]
}

export function OwnListings({ listings: initialListings }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings)
  useEffect(() => { setListings(initialListings) }, [initialListings])
  const [sheet, setSheet] = useState<SheetState>(null)

  const hasSearch = listings.some(l => l.kind === 'search')
  const hasOffer = listings.some(l => l.kind === 'offer')

  function handleDeleted(id: string) {
    setListings(prev => prev.filter(l => l.id !== id))
  }

  function handleSheetClose(newListing?: Listing) {
    if (newListing) {
      setListings(prev => [...prev, newListing])
    }
    setSheet(null)
  }

  const searches = listings.filter(l => l.kind === 'search')
  const offers = listings.filter(l => l.kind === 'offer')

  return (
    <>
      <div className="space-y-3">
        {searches.map(l => (
          <ListingCard
            key={l.id}
            listing={l}
            onDeleted={handleDeleted}
            onEdit={listing => setSheet({ mode: 'edit', listing })}
          />
        ))}
        {offers.map(l => (
          <ListingCard
            key={l.id}
            listing={l}
            onDeleted={handleDeleted}
            onEdit={listing => setSheet({ mode: 'edit', listing })}
          />
        ))}

        {!hasSearch && (
          <AddCard kind="search" onClick={() => setSheet({ mode: 'add', kind: 'search' })} />
        )}
        {!hasOffer && (
          <AddCard kind="offer" onClick={() => setSheet({ mode: 'add', kind: 'offer' })} />
        )}
      </div>

      {sheet && (
        <AddListingSheet
          kind={sheet.mode === 'edit' ? sheet.listing.kind : sheet.kind}
          editListing={sheet.mode === 'edit' ? sheet.listing : undefined}
          onClose={handleSheetClose}
        />
      )}
    </>
  )
}
