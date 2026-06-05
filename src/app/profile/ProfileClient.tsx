'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { updateProfile, deleteAccount } from './actions'

type Props = {
  userId: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
}

function IconCamera({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function IconPencil({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

export function ProfileClient({ userId, firstName, lastName, email, avatarUrl }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [firstNameVal, setFirstNameVal] = useState(firstName)
  const [lastNameVal, setLastNameVal] = useState(lastName)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()

  const displayAvatar = avatarPreview ?? avatarUrl
  const displayName = isEditing ? `${firstNameVal} ${lastNameVal}` : `${firstName} ${lastName}`

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Das Bild darf maximal 5 MB groß sein.')
      return
    }
    setErrorMsg(null)
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setFirstNameVal(firstName)
    setLastNameVal(lastName)
    setAvatarFile(null)
    setAvatarPreview(null)
    setErrorMsg(null)
  }

  function handleSave() {
    if (!firstNameVal.trim() || !lastNameVal.trim()) {
      setErrorMsg('Vor- und Nachname sind Pflichtfelder.')
      return
    }

    startTransition(async () => {
      let avatarPath: string | undefined = undefined

      if (avatarFile) {
        const { data: uploadData } = await supabase.storage
          .from('avatars')
          .upload(userId, avatarFile, { upsert: true, contentType: avatarFile.type })
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(uploadData.path)
          avatarPath = publicUrl
        }
      }

      const result = await updateProfile({
        firstName: firstNameVal.trim(),
        lastName: lastNameVal.trim(),
        avatarPath,
      })

      if (!result.success) {
        setErrorMsg(result.error ?? 'Unbekannter Fehler.')
        return
      }

      setIsEditing(false)
      setAvatarFile(null)
      router.refresh()
    })
  }

  function handleDeleteAccount() {
    startDeleteTransition(async () => {
      await deleteAccount()
    })
  }

  return (
    <div className="space-y-6">

      {/* Profil-Karte */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-start gap-4">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {displayAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayAvatar}
                alt={firstNameVal}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
                aria-hidden="true"
              >
                {firstNameVal[0] ?? '?'}
              </div>
            )}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
                aria-label="Foto ändern"
              >
                <IconCamera className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Name + Email */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={firstNameVal}
                  onChange={e => setFirstNameVal(e.target.value)}
                  placeholder="Vorname"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#6B3CF6' } as React.CSSProperties}
                />
                <input
                  type="text"
                  value={lastNameVal}
                  onChange={e => setLastNameVal(e.target.value)}
                  placeholder="Nachname"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#6B3CF6' } as React.CSSProperties}
                />
              </div>
            ) : (
              <>
                <p className="font-semibold text-gray-800 text-base truncate">{displayName}</p>
                <p className="text-sm text-gray-400 mt-0.5 truncate">{email}</p>
              </>
            )}
          </div>

          {/* Edit-Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer transition-colors hover:bg-gray-50"
              style={{ borderColor: '#E5E7EB', color: '#6B3CF6' }}
            >
              <IconPencil />
              Bearbeiten
            </button>
          )}
        </div>

        {/* Fehlermeldung */}
        {errorMsg && (
          <p className="text-sm font-medium" style={{ color: '#EF4444' }}>{errorMsg}</p>
        )}

        {/* Speichern / Abbrechen */}
        {isEditing && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancelEdit}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-colors disabled:opacity-40"
              style={{ borderColor: '#E5E7EB', color: '#4B5563', backgroundColor: '#FFFFFF' }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !firstNameVal.trim() || !lastNameVal.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
            >
              {isPending ? 'Speichern …' : 'Speichern'}
            </button>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-5 space-y-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Konto</p>

        {confirmDelete ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">
              Dein Konto, alle Listings und alle Verbindungen werden unwiderruflich gelöscht.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border cursor-pointer disabled:opacity-40"
                style={{ borderColor: '#E5E7EB', color: '#4B5563', backgroundColor: '#FFFFFF' }}
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#EF4444' }}
              >
                {isDeleting ? 'Wird gelöscht …' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2.5 rounded-xl text-sm font-medium border cursor-pointer transition-colors hover:bg-red-50"
            style={{ borderColor: '#FCA5A5', color: '#EF4444', backgroundColor: '#FFF5F5' }}
          >
            Konto löschen
          </button>
        )}
      </div>

    </div>
  )
}
