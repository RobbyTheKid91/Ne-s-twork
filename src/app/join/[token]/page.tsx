import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import Image from 'next/image'

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('invites')
    .select('owner_id')
    .eq('token', token)
    .single()

  if (!invite) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-base">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: '#6B3CF6' }}>
            Nestwork
          </h1>
          <p className="text-gray-700 font-medium">
            Dieser Einladungslink ist ungültig.
          </p>
          <p className="text-gray-500 text-sm">
            Frag die Person, die dich eingeladen hat, nach einem neuen Link.
          </p>
          <Link
            href="/"
            className="inline-block text-sm font-medium"
            style={{ color: '#6B3CF6' }}
          >
            Zur Startseite
          </Link>
        </div>
      </main>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('id', invite.owner_id)
    .single()

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-base">
        <div className="w-full max-w-sm text-center space-y-6">
          <h1 className="text-4xl font-bold" style={{ color: '#6B3CF6' }}>
            Nestwork
          </h1>
          <p className="text-gray-700 font-medium">
            Dieser Einladungslink ist ungültig.
          </p>
          <Link href="/" className="inline-block text-sm font-medium" style={{ color: '#6B3CF6' }}>
            Zur Startseite
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-base">
      <div className="w-full max-w-sm text-center space-y-8">
        <h1 className="text-4xl font-bold" style={{ color: '#6B3CF6' }}>
          Nestwork
        </h1>

        <div className="space-y-4">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.first_name}
              width={80}
              height={80}
              className="rounded-full mx-auto object-cover"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
              aria-hidden="true"
            >
              {profile.first_name[0]}
            </div>
          )}

          <p className="text-xl font-semibold text-gray-800">
            {profile.first_name} hat dich eingeladen
          </p>
          <p className="text-gray-500 text-sm">
            Tritt dem Netzwerk bei und finde Wohnungsverbindungen in deinem Umfeld.
          </p>
        </div>

        <Link
          href={`/login?invite_token=${encodeURIComponent(token)}`}
          className="block w-full py-3 px-4 rounded-2xl text-white font-medium text-center transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6B3CF6, #F06292)' }}
        >
          Jetzt beitreten
        </Link>

        <p className="text-xs text-gray-400">
          Für Berliner die Wohnungen vermitteln
        </p>
      </div>
    </main>
  )
}
