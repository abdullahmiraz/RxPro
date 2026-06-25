import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60_000

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW }
  }
  entry.count++
  if (entry.count > RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count, resetIn: entry.resetAt - now }
}

const SALT_ROUNDS = 12

function getHmacSecret(): string {
  return process.env.AUTH_SECRET || 'rxpro-default-secret-do-not-use-in-production'
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function signToken(doctorId: string, name: string): string {
  const payload = JSON.stringify({ doctor_id: doctorId, name })
  const encoded = Buffer.from(payload).toString('base64')
  const hmac = crypto.createHmac('sha256', getHmacSecret()).update(encoded).digest('base64url')
  return `${encoded}.${hmac}`
}

export function verifyToken(token: string): { doctor_id: string; name: string } | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [encoded, signature] = parts
  const expected = crypto.createHmac('sha256', getHmacSecret()).update(encoded).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}
