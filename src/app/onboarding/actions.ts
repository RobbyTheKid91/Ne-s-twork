'use server'

import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase-server'

export type ListingInput = {
  kind: 'search' | 'offer'
  housingType: 'whole' | 'wg_room' | 'sublet'
  size: number
  price: number
  durationFrom?: string
  durationTo?: string
}

type OnboardingInput = {
  firstName: string
  lastName: string
  avatarUrl?: string
  inviteToken?: string
  listing?: ListingInput
}

export type OnboardingResult = {
  success: boolean
  ownToken?: string
  interestedCount?: number
  error?: string
}

export async function completeOnboarding(input: OnboardingInput): Promise<OnboardingResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nicht eingeloggt.' }

  // 1. Profil anlegen (upsert falls Nutzer die Seite neu lädt)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    first_name: input.firstName,
    last_name: input.lastName,
    email: user.email ?? '',
    avatar_url: input.avatarUrl ?? null,
  })
  if (profileError) return { success: false, error: 'Profil konnte nicht gespeichert werden.' }

  // 2. Eigenen Einladungstoken — nur anlegen wenn noch keiner existiert
  let finalToken: string
  const { data: existingInvite } = await supabase
    .from('invites')
    .select('token')
    .eq('owner_id', user.id)
    .single()

  if (existingInvite) {
    finalToken = existingInvite.token
  } else {
    finalToken = randomUUID()
    const { error: inviteError } = await supabase
      .from('invites')
      .insert({ token: finalToken, owner_id: user.id })
    if (inviteError) return { success: false, error: 'Einladungslink konnte nicht erstellt werden.' }
  }

  // 3. Verbindung zum Einlader anlegen falls invite_token in der URL war
  if (input.inviteToken) {
    const { data: invite } = await supabase
      .from('invites')
      .select('owner_id')
      .eq('token', input.inviteToken)
      .single()

    if (invite && invite.owner_id !== user.id) {
      await supabase.from('connections').upsert(
        { inviter_id: invite.owner_id, invitee_id: user.id },
        { ignoreDuplicates: true }
      )
    }
    // Ungültiger Token → kein Fehler, einfach weiter
  }

  // 4. Listing anlegen (optional)
  let interestedCount: number | undefined
  if (input.listing) {
    const { data: newListing } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        kind: input.listing.kind,
        housing_type: input.listing.housingType,
        size: input.listing.size,
        price: input.listing.price,
        duration_from: input.listing.durationFrom ?? null,
        duration_to: input.listing.durationTo ?? null,
      })
      .select('id')
      .single()

    // count_interested funktioniert nur für Angebote (offer)
    if (newListing && input.listing.kind === 'offer') {
      const { data: count } = await supabase.rpc('count_interested', {
        p_offer_id: newListing.id,
      })
      interestedCount = count ?? 0
    }
  }

  return { success: true, ownToken: finalToken, interestedCount }
}
