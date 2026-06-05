'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function deleteListing(listingId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('listings').delete().eq('id', listingId).eq('user_id', user.id)
  revalidatePath('/dashboard')
}

export async function togglePauseListing(
  listingId: string,
  currentStatus: 'active' | 'paused'
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const newStatus = currentStatus === 'active' ? 'paused' : 'active'
  await supabase.from('listings').update({ status: newStatus }).eq('id', listingId).eq('user_id', user.id)
  revalidatePath('/dashboard')
}

export type ListingInput = {
  kind: 'search' | 'offer'
  housingType: 'whole' | 'wg_room' | 'sublet'
  size: number
  price: number
  durationFrom?: string
  durationTo?: string
  districts?: string[]
}

export async function updateListing(
  listingId: string,
  input: ListingInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('listings')
    .update({
      housing_type: input.housingType,
      size: input.size,
      price: input.price,
      duration_from: input.durationFrom ?? null,
      duration_to: input.durationTo ?? null,
      districts: input.districts ?? [],
    })
    .eq('id', listingId)

  if (error) return { success: false, error: 'Listing konnte nicht aktualisiert werden.' }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function addListing(
  input: ListingInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nicht eingeloggt.' }

  // Constraint: max. 1 Gesuch + 1 Angebot
  const { data: existing } = await supabase
    .from('listings')
    .select('id')
    .eq('user_id', user.id)
    .eq('kind', input.kind)
    .in('status', ['active', 'paused'])
    .maybeSingle()

  if (existing) {
    return {
      success: false,
      error: `Du hast bereits ein aktives ${input.kind === 'search' ? 'Gesuch' : 'Angebot'}.`,
    }
  }

  const { error } = await supabase.from('listings').insert({
    user_id: user.id,
    kind: input.kind,
    housing_type: input.housingType,
    size: input.size,
    price: input.price,
    duration_from: input.durationFrom ?? null,
    duration_to: input.durationTo ?? null,
    districts: input.districts ?? [],
  })

  if (error) return { success: false, error: 'Listing konnte nicht gespeichert werden.' }

  revalidatePath('/dashboard')
  return { success: true }
}
