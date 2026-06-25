import { NextResponse } from 'next/server'
import { getDb } from '@/lib/database'

export async function GET() {
  try {
    const db = getDb()
    db.prepare('SELECT 1').get()
    return NextResponse.json({ status: 'ok', db: 'connected' })
  } catch {
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 503 })
  }
}
