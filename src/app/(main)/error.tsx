"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20" role="alert">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-500">
        <svg
          className="size-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button variant="destructive" onClick={reset} aria-label="Try again">
        Try again
      </Button>
    </div>
  )
}
