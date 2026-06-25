import { NextRequest, NextResponse } from 'next/server'
import { backupDatabase } from '@/lib/database'

export async function POST(_request: NextRequest) {
  try {
    const path = backupDatabase()
    return NextResponse.json({ success: true, path })
  } catch (error) {
    console.error('[Backup]', error)
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}
