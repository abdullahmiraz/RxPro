export default function Loading() {
  return (
    <div className="animate-pulse space-y-8" role="status" aria-label="Loading content">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-10 w-full rounded bg-muted" />
      <div className="h-64 w-full rounded-xl bg-muted" />
    </div>
  )
}
