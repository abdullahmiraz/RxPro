import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import * as dal from '@/lib/dal'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, securityWord } = body as { name?: string; securityWord?: string }

    if (!name || !securityWord) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }

    const doctor = await dal.fetchDoctorByCredentials(name, securityWord)
    if (!doctor) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const doctorRecord = doctor as { id: string; name: string }
    const token = signToken(doctorRecord.id, doctorRecord.name)
    const cookieStore = await cookies()

    cookieStore.set('doctor_id', doctorRecord.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })

    cookieStore.set('rx-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400,
    })

    return NextResponse.json({ success: true, doctor: { id: doctorRecord.id, name: doctorRecord.name } })
  } catch (error) {
    console.error('[Login]', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
