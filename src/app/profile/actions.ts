'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export type UpdateProfileInput = {
  firstName: string
  lastName: string
  avatarPath?: string | null
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Nicht eingeloggt.' }

  const updates: Record<string, string | null> = {
    first_name: input.firstName,
    last_name: input.lastName,
  }
  if (input.avatarPath !== undefined) {
    updates.avatar_url = input.avatarPath
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { success: false, error: 'Profil konnte nicht gespeichert werden.' }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Avatar aus Storage entfernen (Fehler ignorieren — Bucket könnte leer sein)
  await supabase.storage.from('avatars').remove([user.id])

  // Auth-User löschen — CASCADE in Supabase löscht danach auch das Profil
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    // Profil manuell löschen falls Auth-Delete fehlschlägt
    await supabase.from('profiles').delete().eq('id', user.id)
  }

  redirect('/login')
}
