"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useRouter } from "next/navigation"
import { Stethoscope, Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = yup.object({
  name: yup.string().required("Doctor name is required"),
  securityWord: yup
    .string()
    .required("Password is required")
    .min(4, "Password must be at least 4 characters"),
})

type FormData = yup.InferType<typeof schema>

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const mountedRef = useRef(true)
  const router = useRouter()

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = useCallback(
    async (data: FormData) => {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.name, securityWord: data.securityWord }),
        })

        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || 'Login failed')
        }

        if (mountedRef.current) {
          router.push("/dashboard")
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Login failed")
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    },
    [router]
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/50 bg-white p-8 shadow-lg">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-xl bg-blue-600">
          <Stethoscope className="size-7 text-white" />
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to RxPro
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div
            className="mb-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Doctor Name</Label>
            <Input
              id="name"
              type="text"
              autoComplete="username"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="securityWord">Password</Label>
            <div className="relative">
              <Input
                id="securityWord"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={!!errors.securityWord}
                {...register("securityWord")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Toggle password visibility"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.securityWord && (
              <p className="text-sm text-destructive" role="alert">
                {errors.securityWord.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  )
}
