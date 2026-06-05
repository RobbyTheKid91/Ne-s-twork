'use client'

import { useState } from 'react'

function IconCopy({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )
}

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function IconShare({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

export function InviteLink({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)
  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${token}`
  const shortLink = link.replace(/^https?:\/\//, '')

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (!navigator.share) {
      await handleCopy()
      return
    }
    try {
      await navigator.share({
        title: 'Nestwork',
        text: 'Komm in mein Netzwerk auf Nestwork:',
        url: link,
      })
    } catch { /* Dialog geschlossen */ }
  }

  return (
    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
      <span className="text-xs text-gray-500 truncate max-w-[140px]" title={link}>
        {shortLink}
      </span>

      <button
        onClick={handleCopy}
        title="Link kopieren"
        className="flex-shrink-0 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
        style={{ color: copied ? '#16A34A' : '#6B3CF6' }}
      >
        {copied ? <IconCheck /> : <IconCopy />}
      </button>

      <button
        onClick={handleShare}
        title="Teilen"
        className="flex-shrink-0 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-gray-200"
        style={{ color: '#6B3CF6' }}
      >
        <IconShare />
      </button>
    </div>
  )
}
