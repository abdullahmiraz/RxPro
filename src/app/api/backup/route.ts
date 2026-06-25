import { NextRequest, NextResponse } from 'next/server'
import { backupDatabase } from '@/lib/database'
import { verifyToken } from '@/lib/auth'

function checkOrigin(request: NextRequest): boolean {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  if (origin) return origin === allowedOrigin
  if (referer) return referer.startsWith(allowedOrigin)
  return true
}

export async function POST(request: NextRequest) {
  const reqId = crypto.randomUUID().substring(0, 8)
  try {
    if (!checkOrigin(request)) {
      console.log(JSON.stringify({ reqId, method: 'POST', path: '/api/backup', status: 403, error: 'csrf_detected' }))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const doctorId = request.cookies.get('doctor_id')?.value
    const token = request.cookies.get('rx-token')?.value
    if (!doctorId || !token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backupPath = backupDatabase()
    console.log(JSON.stringify({ reqId, method: 'POST', path: '/api/backup', status: 200 }))
    return NextResponse.json({ success: true, path: backupPath })
  } catch (error) {
    console.error(JSON.stringify({ reqId, method: 'POST', path: '/api/backup', status: 500, error: error instanceof Error ? error.message : 'Unknown' }))
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 })
  }
}
