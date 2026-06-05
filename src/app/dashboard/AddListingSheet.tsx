'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addListing, updateListing, type ListingInput } from './actions'
import type { Listing } from './NetworkCard'

type HousingType = 'whole' | 'wg_room' | 'sublet'

function mapPriceSlider(v: number): number {
  if (v <= 70) return Math.round(200 + (v / 70) * 1800)
  return Math.round(2000 + ((v - 70) / 30) * 2000)
}

function mapSizeSlider(v: number): number {
  if (v <= 75) return Math.round(7 + (v / 75) * 113)
  return Math.round(120 + ((v - 75) / 25) * 180)
}

// Umkehrfunktionen für Vorausfüllen beim Bearbeiten
function unmapPriceSlider(price: number): number {
  if (price <= 2000) return Math.round((price - 200) / 1800 * 70)
  return Math.round(70 + (price - 2000) / 2000 * 30)
}

function unmapSizeSlider(size: number): number {
  if (size <= 120) return Math.round((size - 7) / 113 * 75)
  return Math.round(75 + (size - 120) / 180 * 25)
}

const HOUSING_TYPES: { value: HousingType; label: string }[] = [
  { value: 'whole', label: 'Ganze Wohnung' },
  { value: 'wg_room', label: 'WG-Zimmer' },
  { value: 'sublet', label: 'Zwischenmiete' },
]

const ALL_DISTRICTS = [
  'Mitte',
  'Friedrichshain-Kreuzberg',
  'Pankow',
  'Charlottenburg-Wilmersdorf',
  'Spandau',
  'Steglitz-Zehlendorf',
  'Tempelhof-Schöneberg',
  'Neukölln',
  'Treptow-Köpenick',
  'Marzahn-Hellersdorf',
  'Lichtenberg',
  'Reinickendorf',
]

type Props = {
  kind: 'search' | 'offer'
  onClose: (newListing?: Listing) => void
  // Wenn gesetzt → Bearbeiten-Modus
  editListing?: Listing
}

export function AddListingSheet({ kind, onClose, editListing }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditMode = !!editListing

  const [housingType, setHousingType] = useState<HousingType>(
    (editListing?.housing_type as HousingType) ?? 'whole'
  )
  const [priceSlider, setPriceSlider] = useState(
    editListing ? unmapPriceSlider(editListing.price) : 35
  )
  const [sizeSlider, setSizeSlider] = useState(
    editListing ? unmapSizeSlider(editListing.size) : 30
  )
  const [durationFrom, setDurationFrom] = useState(editListing?.duration_from ?? '')
  const [durationTo, setDurationTo] = useState(editListing?.duration_to ?? '')
  const [districts, setDistricts] = useState<string[]>(
    editListing?.districts ?? (kind === 'search' ? ALL_DISTRICTS : [])
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const allSelected = ALL_DISTRICTS.every(d => districts.includes(d))

  function toggleAllDistricts() {
    setDistricts(allSelected ? [] : ALL_DISTRICTS)
  }

  function toggleDistrict(d: string) {
    setDistricts(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  const price = mapPriceSlider(priceSlider)
  const size = mapSizeSlider(sizeSlider)
  const isOffer = kind === 'offer'

  function handleSubmit() {
    setErrorMsg(null)
    if (housingType === 'sublet') {
      if (!durationFrom || !durationTo) { setErrorMsg('Bitte beide Datumswerte angeben.'); return }
      if (durationFrom >= durationTo) { setErrorMsg('Startdatum muss vor dem Enddatum liegen.'); return }
    }
    const input: ListingInput = {
      kind, housingType, size, price,
      districts,
      ...(housingType === 'sublet' ? { durationFrom, durationTo } : {}),
    }
    startTransition(async () => {
      const result = isEditMode && editListing
        ? await updateListing(editListing.id, input)
        : await addListing(input)

      if (!result.success) { setErrorMsg(result.error ?? 'Fehler beim Speichern.'); return }

      if (!isEditMode) {
        // Optimistisches Listing sofort anzeigen — router.refresh() läuft im Hintergrund
        const optimistic: Listing = {
          id: `temp-${Date.now()}`,
          kind,
          housing_type: housingType,
          size,
          price,
          status: 'active',
          duration_from: durationFrom || null,
          duration_to: durationTo || null,
          districts,
        }
        router.refresh() // Hintergrund-Sync, nicht abwarten
        onClose(optimistic)
      } else {
        router.refresh()
        onClose()
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => onClose()} aria-hidden="true" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden"
          style={{ maxWidth: 440, maxHeight: '85vh' }}
          role="dialog"
          aria-modal="true"
        >
          {/* Ladebalken oben */}
          {isPending && (
            <div className="h-1 w-full overflow-hidden flex-shrink-0" style={{ backgroundColor: '#EDE9FE' }}>
              <div
                className="h-full animate-pulse"
                style={{ backgroundColor: '#6B3CF6', width: '60%', animation: 'loading-bar 1.2s ease-in-out infinite' }}
              />
            </div>
          )}

          {/* Scrollbarer Inhalt */}
          <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-6 pb-4 space-y-5">
            <h2 className="text-xl font-bold" style={{ color: '#6B3CF6' }}>
              {isEditMode
                ? (isOffer ? 'Angebot bearbeiten' : 'Gesuch bearbeiten')
                : (isOffer ? 'Angebot hinzufügen' : 'Gesuch hinzufügen')}
            </h2>

            {/* Wohnungstyp — beim Bearbeiten gesperrt (kind ändert sich nicht) */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Wohnungstyp</p>
              <div className="flex flex-col gap-2">
                {HOUSING_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHousingType(value)}
                    className="w-full px-4 py-2.5 rounded-2xl border text-left text-sm font-medium cursor-pointer transition-all"
                    style={
                      housingType === value
                        ? { backgroundColor: '#6B3CF6', borderColor: '#6B3CF6', color: '#FFFFFF' }
                        : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#1F2937' }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preis */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  {isOffer ? 'Warmmiete' : 'Maximalbudget'}
                </p>
                <span className="text-base font-bold" style={{ color: '#6B3CF6', fontVariantNumeric: 'tabular-nums', minWidth: '5.5rem', textAlign: 'right' }}>
                  {price.toLocaleString('de-DE')} €
                </span>
              </div>
              <input type="range" min={0} max={100} value={priceSlider}
                onChange={e => setPriceSlider(Number(e.target.value))}
                className="w-full cursor-pointer" style={{ accentColor: '#6B3CF6' }} />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>200 €</span><span>4.000 €</span>
              </div>
            </div>

            {/* Größe */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  {isOffer ? 'Wohnungsgröße' : 'Mindestgröße'}
                </p>
                <span className="text-base font-bold" style={{ color: '#6B3CF6', fontVariantNumeric: 'tabular-nums', minWidth: '4rem', textAlign: 'right' }}>
                  {size} m²
                </span>
              </div>
              <input type="range" min={0} max={100} value={sizeSlider}
                onChange={e => setSizeSlider(Number(e.target.value))}
                className="w-full cursor-pointer" style={{ accentColor: '#6B3CF6' }} />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>7 m²</span><span>300 m²</span>
              </div>
            </div>

            {/* Zeitraum */}
            {housingType === 'sublet' && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Zeitraum</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block" htmlFor="modal-from">Von</label>
                    <input id="modal-from" type="date" value={durationFrom}
                      onChange={e => setDurationFrom(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none"
                      style={{ fontSize: '16px' }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block" htmlFor="modal-to">Bis</label>
                    <input id="modal-to" type="date" value={durationTo}
                      onChange={e => setDurationTo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-gray-900 bg-white focus:outline-none"
                      style={{ fontSize: '16px' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Bezirke */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Bezirke</p>
              <div className="flex flex-wrap gap-2">
                {/* Alle-Toggle */}
                <button
                  type="button"
                  onClick={toggleAllDistricts}
                  className="px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer"
                  style={
                    allSelected
                      ? { backgroundColor: '#6B3CF6', borderColor: '#6B3CF6', color: '#FFFFFF' }
                      : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#6B7280' }
                  }
                >
                  Alle Bezirke
                </button>
                {ALL_DISTRICTS.map(d => {
                  const active = districts.includes(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDistrict(d)}
                      className="px-3 py-1.5 rounded-2xl border text-xs font-medium transition-all cursor-pointer"
                      style={
                        active
                          ? { backgroundColor: '#EDE9FE', borderColor: '#C4B5FD', color: '#6B3CF6' }
                          : { backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', color: '#6B7280' }
                      }
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500 text-center" role="alert">{errorMsg}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
            <button
              onClick={() => onClose(undefined)}
              disabled={isPending}
              className="flex-1 py-3 rounded-2xl font-medium text-gray-600 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 py-3 rounded-2xl font-semibold text-white cursor-pointer transition-opacity disabled:opacity-40"
              style={{ backgroundColor: '#6B3CF6' }}
            >
              {isPending ? 'Wird gespeichert…' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(80%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </>
  )
}
