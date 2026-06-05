export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-base pb-12" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="h-6 w-24 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-8 w-24 rounded-xl bg-gray-100 animate-pulse" />
      </div>

      <div className="px-4 pt-5 space-y-6">
        <div className="space-y-3">
          <div className="h-3 w-20 rounded-lg bg-gray-100 animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-28 rounded-lg bg-gray-100 animate-pulse" />
                <div className="h-3 w-40 rounded-lg bg-gray-100 animate-pulse" />
              </div>
            </div>
            <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-3 w-24 rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
