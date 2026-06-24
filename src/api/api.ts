import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'

type DoctorRow = Database['public']['Tables']['rx_doctors']['Row']
type DoctorInsert = Database['public']['Tables']['rx_doctors']['Insert']
type DoctorUpdate = Database['public']['Tables']['rx_doctors']['Update']

type PatientRow = Database['public']['Tables']['rx_patients']['Row']
type PatientInsert = Database['public']['Tables']['rx_patients']['Insert']
type PatientUpdate = Database['public']['Tables']['rx_patients']['Update']

type AppointmentRow = Database['public']['Tables']['rx_appointments']['Row']
type AppointmentInsert = Database['public']['Tables']['rx_appointments']['Insert']
type AppointmentUpdate = Database['public']['Tables']['rx_appointments']['Update']

type PrescriptionRow = Database['public']['Tables']['rx_prescriptions']['Row']
type PrescriptionInsert = Database['public']['Tables']['rx_prescriptions']['Insert']
type PrescriptionUpdate = Database['public']['Tables']['rx_prescriptions']['Update']

type SetupRow = Database['public']['Tables']['rx_setups']['Row']
type SetupInsert = Database['public']['Tables']['rx_setups']['Insert']
type SetupUpdate = Database['public']['Tables']['rx_setups']['Update']

type FavoriteSetupRow = Database['public']['Tables']['rx_favorite_setups']['Row']
type FavoriteSetupInsert = Database['public']['Tables']['rx_favorite_setups']['Insert']
type FavoriteSetupUpdate = Database['public']['Tables']['rx_favorite_setups']['Update']

type FavoriteMedicineRow = Database['public']['Tables']['rx_favorite_medicines']['Row']
type FavoriteMedicineInsert = Database['public']['Tables']['rx_favorite_medicines']['Insert']
type FavoriteMedicineUpdate = Database['public']['Tables']['rx_favorite_medicines']['Update']

type InstructionRow = Database['public']['Tables']['rx_instructions']['Row']
type InstructionInsert = Database['public']['Tables']['rx_instructions']['Insert']
type InstructionUpdate = Database['public']['Tables']['rx_instructions']['Update']

type RouteTypeRow = Database['public']['Tables']['rx_route_types']['Row']
type RouteTypeInsert = Database['public']['Tables']['rx_route_types']['Insert']
type RouteTypeUpdate = Database['public']['Tables']['rx_route_types']['Update']

type DoctorInfoRow = Database['public']['Tables']['rx_doctor_info']['Row']
type DoctorInfoInsert = Database['public']['Tables']['rx_doctor_info']['Insert']

// ── Doctor ──────────────────────────────────────────────────────────────────

export async function fetchDoctor(doctorId: string): Promise<DoctorRow | null> {
  const { data, error } = await supabase
    .from('rx_doctors')
    .select('*')
    .eq('id', doctorId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchDoctorByCredentials(
  name: string,
  securityWord: string,
): Promise<DoctorRow | null> {
  const { data, error } = await supabase
    .from('rx_doctors')
    .select('*')
    .eq('name', name)
    .eq('security_word', securityWord)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Patient ─────────────────────────────────────────────────────────────────

export async function fetchPatients(): Promise<PatientRow[]> {
  const { data, error } = await supabase
    .from('rx_patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchPatient(id: string): Promise<PatientRow | null> {
  const { data, error } = await supabase
    .from('rx_patients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Appointment ─────────────────────────────────────────────────────────────

export async function fetchAppointments(
  doctorId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<AppointmentRow[]> {
  let query = supabase
    .from('rx_appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: false })

  if (dateFrom) {
    query = query.gte('appointment_date', dateFrom)
  }

  if (dateTo) {
    query = query.lte('appointment_date', dateTo)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchAppointment(id: string): Promise<AppointmentRow | null> {
  const { data, error } = await supabase
    .from('rx_appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Prescription ────────────────────────────────────────────────────────────

export async function fetchPrescriptions(doctorId: string): Promise<PrescriptionRow[]> {
  const { data, error } = await supabase
    .from('rx_prescriptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function fetchPrescription(id: string): Promise<PrescriptionRow | null> {
  const { data, error } = await supabase
    .from('rx_prescriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Setup ───────────────────────────────────────────────────────────────────

export async function fetchSetup(): Promise<SetupRow[]> {
  const { data, error } = await supabase
    .from('rx_setups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Favorite Setup ──────────────────────────────────────────────────────────

export async function fetchFavoriteSetups(): Promise<FavoriteSetupRow[]> {
  const { data, error } = await supabase
    .from('rx_favorite_setups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Favorite Medicine ───────────────────────────────────────────────────────

export async function fetchFavoriteMedicines(): Promise<FavoriteMedicineRow[]> {
  const { data, error } = await supabase
    .from('rx_favorite_medicines')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Instruction ─────────────────────────────────────────────────────────────

export async function fetchInstructions(): Promise<InstructionRow[]> {
  const { data, error } = await supabase
    .from('rx_instructions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Route Type ──────────────────────────────────────────────────────────────

export async function fetchRouteTypes(): Promise<RouteTypeRow[]> {
  const { data, error } = await supabase
    .from('rx_route_types')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ── Doctor Info ─────────────────────────────────────────────────────────────

export async function fetchDoctorInfo(doctorId: string): Promise<DoctorInfoRow | null> {
  const { data, error } = await supabase
    .from('rx_doctor_info')
    .select('*')
    .eq('doctor_id', doctorId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// ═══════════════════════════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Patient ─────────────────────────────────────────────────────────────────

export async function createPatient(data: PatientInsert): Promise<PatientRow | null> {
  const { data: result, error } = await supabase
    .from('rx_patients')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updatePatient(id: string, data: PatientUpdate): Promise<PatientRow | null> {
  const { data: result, error } = await supabase
    .from('rx_patients')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_patients')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Appointment ─────────────────────────────────────────────────────────────

export async function createAppointment(data: AppointmentInsert): Promise<AppointmentRow | null> {
  const { data: result, error } = await supabase
    .from('rx_appointments')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updateAppointment(
  id: string,
  data: AppointmentUpdate,
): Promise<AppointmentRow | null> {
  const { data: result, error } = await supabase
    .from('rx_appointments')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_appointments')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Prescription ────────────────────────────────────────────────────────────

export async function createPrescription(data: PrescriptionInsert): Promise<PrescriptionRow | null> {
  const { data: result, error } = await supabase
    .from('rx_prescriptions')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updatePrescription(
  id: string,
  data: PrescriptionUpdate,
): Promise<PrescriptionRow | null> {
  const { data: result, error } = await supabase
    .from('rx_prescriptions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deletePrescription(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_prescriptions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Setup ───────────────────────────────────────────────────────────────────

export async function createSetup(data: SetupInsert): Promise<SetupRow | null> {
  const { data: result, error } = await supabase
    .from('rx_setups')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updateSetup(id: string, data: SetupUpdate): Promise<SetupRow | null> {
  const { data: result, error } = await supabase
    .from('rx_setups')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deleteSetup(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_setups')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Favorite Setup ──────────────────────────────────────────────────────────

export async function createFavoriteSetup(data: FavoriteSetupInsert): Promise<FavoriteSetupRow | null> {
  const { data: result, error } = await supabase
    .from('rx_favorite_setups')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updateFavoriteSetup(
  id: string,
  data: FavoriteSetupUpdate,
): Promise<FavoriteSetupRow | null> {
  const { data: result, error } = await supabase
    .from('rx_favorite_setups')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deleteFavoriteSetup(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_favorite_setups')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Favorite Medicine ───────────────────────────────────────────────────────

export async function createFavoriteMedicine(
  data: FavoriteMedicineInsert,
): Promise<FavoriteMedicineRow | null> {
  const { data: result, error } = await supabase
    .from('rx_favorite_medicines')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updateFavoriteMedicine(
  id: string,
  data: FavoriteMedicineUpdate,
): Promise<FavoriteMedicineRow | null> {
  const { data: result, error } = await supabase
    .from('rx_favorite_medicines')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deleteFavoriteMedicine(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_favorite_medicines')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Instruction ─────────────────────────────────────────────────────────────

export async function createInstruction(data: InstructionInsert): Promise<InstructionRow | null> {
  const { data: result, error } = await supabase
    .from('rx_instructions')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updateInstruction(
  id: string,
  data: InstructionUpdate,
): Promise<InstructionRow | null> {
  const { data: result, error } = await supabase
    .from('rx_instructions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deleteInstruction(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_instructions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Route Type ──────────────────────────────────────────────────────────────

export async function createRouteType(data: RouteTypeInsert): Promise<RouteTypeRow | null> {
  const { data: result, error } = await supabase
    .from('rx_route_types')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function updateRouteType(
  id: string,
  data: RouteTypeUpdate,
): Promise<RouteTypeRow | null> {
  const { data: result, error } = await supabase
    .from('rx_route_types')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}

export async function deleteRouteType(id: string): Promise<void> {
  const { error } = await supabase
    .from('rx_route_types')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

// ── Doctor Info ─────────────────────────────────────────────────────────────

export async function upsertDoctorInfo(data: DoctorInfoInsert): Promise<DoctorInfoRow | null> {
  const { data: result, error } = await supabase
    .from('rx_doctor_info')
    .upsert(data)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return result
}
