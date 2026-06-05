export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-base pb-12" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
        <div className="h-6 w-28 rounded-lg bg-gray-100 animate-pulse" />
      </div>

      <div className="px-4 pt-5 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-3 w-48 rounded-lg bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-3 w-28 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
