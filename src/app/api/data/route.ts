import { NextRequest, NextResponse } from 'next/server'
import * as dal from '@/lib/dal'
import { verifyToken } from '@/lib/auth'

// Actions that don't require authentication (login only)
const PUBLIC_ACTIONS = new Set(['fetchDoctorByCredentials'])

// Actions that accept a `data` object — authenticated doctorId overrides any client-supplied value
const DATA_ACTIONS_WITH_DOCTOR_ID = new Set([
  'createPatient',
  'createAppointment',
  'createPrescription',
  'updateAppointment',
  'updatePrescription',
  'upsertDoctorInfo',
])

// Actions that take `doctorId` as a top-level param (list-fetch by doctor)
const LIST_FETCH_DOCTOR_ACTIONS = new Set([
  'fetchAppointments',
  'fetchPrescriptions',
  'fetchDoctorInfo',
])

// Single-record operations that need doctorId for ownership checks
const SINGLE_RECORD_ACTIONS = new Set([
  'fetchPatient',
  'fetchAppointment',
  'fetchPrescription',
  'updatePatient',
  'updateAppointment',
  'updatePrescription',
  'deletePatient',
  'deleteAppointment',
  'deletePrescription',
])

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
  fetchPatients: (p) => dal.fetchPatients(p.doctorId as string | undefined),
  fetchPatient: (p) => dal.fetchPatient(p.id as string, p.doctorId as string | undefined),
  createPatient: (p) => dal.createPatient(p.data as Record<string, unknown>),
  updatePatient: (p) => dal.updatePatient(p.id as string, p.data as Record<string, unknown>, p.doctorId as string | undefined),
  deletePatient: (p) => dal.deletePatient(p.id as string, p.doctorId as string | undefined),
  fetchAppointments: (p) => dal.fetchAppointments(p.doctorId as string),
  fetchAppointment: (p) => dal.fetchAppointment(p.id as string, p.doctorId as string | undefined),
  createAppointment: (p) => dal.createAppointment(p.data as Record<string, unknown>),
  updateAppointment: (p) => dal.updateAppointment(p.id as string, p.data as Record<string, unknown>, p.doctorId as string | undefined),
  deleteAppointment: (p) => dal.deleteAppointment(p.id as string, p.doctorId as string | undefined),
  fetchPrescriptions: (p) => dal.fetchPrescriptions(p.doctorId as string),
  fetchPrescription: (p) => dal.fetchPrescription(p.id as string, p.doctorId as string | undefined),
  createPrescription: (p) => dal.createPrescription(p.data as Record<string, unknown>),
  updatePrescription: (p) => dal.updatePrescription(p.id as string, p.data as Record<string, unknown>, p.doctorId as string | undefined),
  deletePrescription: (p) => dal.deletePrescription(p.id as string, p.doctorId as string | undefined),
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
      const { doctorId } = auth

      // C6: Inject authenticated doctorId — ignore any client-supplied value.
      // For create/update actions, force the data payload's doctor_id to the session doctor.
      if (DATA_ACTIONS_WITH_DOCTOR_ID.has(action) && params.data && typeof params.data === 'object') {
        (params.data as Record<string, unknown>).doctor_id = doctorId
      }

      // For list-fetch and single-record actions, force the doctorId param to the session doctor.
      if (LIST_FETCH_DOCTOR_ACTIONS.has(action) || SINGLE_RECORD_ACTIONS.has(action)) {
        params.doctorId = doctorId
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
