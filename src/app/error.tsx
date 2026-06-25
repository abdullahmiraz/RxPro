'use client'
export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="mb-6 text-sm text-muted-foreground">Please try again or contact support.</p>
        <button onClick={reset} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Try Again
        </button>
      </div>
    </div>
  )
}
