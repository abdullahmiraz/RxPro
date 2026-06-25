import { NextRequest, NextResponse } from 'next/server'
import * as dal from '@/lib/dal'
import { verifyToken } from '@/lib/auth'

// Actions that don't require authentication (login only)
const PUBLIC_ACTIONS = new Set(['fetchDoctorByCredentials'])

function authenticate(request: NextRequest): { doctorId: string } | NextResponse {
  const doctorId = request.cookies.get('doctor_id')?.value
  const token = request.cookies.get('rx-token')?.value

  if (!doctorId || !token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.doctor_id !== doctorId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { doctorId }
}

const handlers: Record<string, (params: Record<string, unknown>) => unknown> = {
  fetchDoctor: (p) => dal.fetchDoctor(p.id as string),
  fetchDoctorByCredentials: (p) => dal.fetchDoctorByCredentials(p.name as string, p.securityWord as string),
  fetchPatients: () => dal.fetchPatients(),
  fetchPatient: (p) => dal.fetchPatient(p.id as string),
  createPatient: (p) => dal.createPatient(p.data as Record<string, unknown>),
  updatePatient: (p) => dal.updatePatient(p.id as string, p.data as Record<string, unknown>),
  deletePatient: (p) => dal.deletePatient(p.id as string),
  fetchAppointments: (p) => dal.fetchAppointments(p.doctorId as string),
  fetchAppointment: (p) => dal.fetchAppointment(p.id as string),
  createAppointment: (p) => dal.createAppointment(p.data as Record<string, unknown>),
  updateAppointment: (p) => dal.updateAppointment(p.id as string, p.data as Record<string, unknown>),
  deleteAppointment: (p) => dal.deleteAppointment(p.id as string),
  fetchPrescriptions: (p) => dal.fetchPrescriptions(p.doctorId as string),
  fetchPrescription: (p) => dal.fetchPrescription(p.id as string),
  createPrescription: (p) => dal.createPrescription(p.data as Record<string, unknown>),
  updatePrescription: (p) => dal.updatePrescription(p.id as string, p.data as Record<string, unknown>),
  deletePrescription: (p) => dal.deletePrescription(p.id as string),
  fetchSetup: () => dal.fetchSetup(),
  createSetup: (p) => dal.createSetup(p.data as Record<string, unknown>),
  updateSetup: (p) => dal.updateSetup(p.id as string, p.data as Record<string, unknown>),
  deleteSetup: (p) => dal.deleteSetup(p.id as string),
  fetchFavoriteSetups: () => dal.fetchFavoriteSetups(),
  createFavoriteSetup: (p) => dal.createFavoriteSetup(p.data as Record<string, unknown>),
  updateFavoriteSetup: (p) => dal.updateFavoriteSetup(p.id as string, p.data as Record<string, unknown>),
  deleteFavoriteSetup: (p) => dal.deleteFavoriteSetup(p.id as string),
  fetchFavoriteMedicines: () => dal.fetchFavoriteMedicines(),
  createFavoriteMedicine: (p) => dal.createFavoriteMedicine(p.data as Record<string, unknown>),
  updateFavoriteMedicine: (p) => dal.updateFavoriteMedicine(p.id as string, p.data as Record<string, unknown>),
  deleteFavoriteMedicine: (p) => dal.deleteFavoriteMedicine(p.id as string),
  fetchInstructions: () => dal.fetchInstructions(),
  createInstruction: (p) => dal.createInstruction(p.data as Record<string, unknown>),
  updateInstruction: (p) => dal.updateInstruction(p.id as string, p.data as Record<string, unknown>),
  deleteInstruction: (p) => dal.deleteInstruction(p.id as string),
  fetchRouteTypes: () => dal.fetchRouteTypes(),
  createRouteType: (p) => dal.createRouteType(p.data as Record<string, unknown>),
  updateRouteType: (p) => dal.updateRouteType(p.id as string, p.data as Record<string, unknown>),
  deleteRouteType: (p) => dal.deleteRouteType(p.id as string),
  fetchDoctorInfo: (p) => dal.fetchDoctorInfo(p.doctorId as string),
  upsertDoctorInfo: (p) => dal.upsertDoctorInfo(p.data as Record<string, unknown>),
}

export async function POST(request: NextRequest) {
  const reqId = crypto.randomUUID().substring(0, 8)
  const start = Date.now()
  let action = 'unknown'
  let status = 200
  try {
    const body = await request.json()
    const parsed = body as { action: string; params: Record<string, unknown> }
    action = parsed.action ?? 'unknown'
    const params = parsed.params ?? {}

    const handler = handlers[action]
    if (!handler) {
      status = 400
      console.log(JSON.stringify({ reqId, method: 'POST', path: '/api/data', action, status, ms: Date.now() - start }))
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    if (!PUBLIC_ACTIONS.has(action)) {
      const auth = authenticate(request)
      if (auth instanceof NextResponse) {
        status = 401
        console.log(JSON.stringify({ reqId, method: 'POST', path: '/api/data', action, status, ms: Date.now() - start }))
        return auth
      }
    }

    const result = handler(params)
    console.log(JSON.stringify({ reqId, method: 'POST', path: '/api/data', action, status, ms: Date.now() - start }))
    return NextResponse.json({ data: result })
  } catch (error) {
    status = 500
    console.error(JSON.stringify({ reqId, method: 'POST', path: '/api/data', action, status, ms: Date.now() - start, error: error instanceof Error ? error.message : 'Unknown' }))
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
