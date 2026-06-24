async function callApi<T>(action: string, params?: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, params }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'API error')
  }
  const json = await res.json()
  return json.data as T
}

// ── Doctor ──────────────────────────────────────────────────────────────────

export async function fetchDoctor(doctorId: string): Promise<Record<string, unknown> | undefined> {
  return callApi('fetchDoctor', { id: doctorId })
}

export async function fetchDoctorByCredentials(
  name: string,
  securityWord: string,
): Promise<Record<string, unknown> | undefined> {
  return callApi('fetchDoctorByCredentials', { name, securityWord })
}

// ── Patient ─────────────────────────────────────────────────────────────────

export async function fetchPatients(): Promise<Record<string, unknown>[]> {
  return callApi('fetchPatients')
}

export async function fetchPatient(id: string): Promise<Record<string, unknown> | undefined> {
  return callApi('fetchPatient', { id })
}

export async function createPatient(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createPatient', { data })
}

export async function updatePatient(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updatePatient', { id, data })
}

export async function deletePatient(id: string): Promise<{ success: boolean }> {
  return callApi('deletePatient', { id })
}

// ── Appointment ─────────────────────────────────────────────────────────────

export async function fetchAppointments(
  doctorId: string,
): Promise<Record<string, unknown>[]> {
  return callApi('fetchAppointments', { doctorId })
}

export async function fetchAppointment(id: string): Promise<Record<string, unknown> | undefined> {
  return callApi('fetchAppointment', { id })
}

export async function createAppointment(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createAppointment', { data })
}

export async function updateAppointment(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updateAppointment', { id, data })
}

export async function deleteAppointment(id: string): Promise<{ success: boolean }> {
  return callApi('deleteAppointment', { id })
}

// ── Prescription ────────────────────────────────────────────────────────────

export async function fetchPrescriptions(doctorId: string): Promise<Record<string, unknown>[]> {
  return callApi('fetchPrescriptions', { doctorId })
}

export async function fetchPrescription(id: string): Promise<Record<string, unknown> | undefined> {
  return callApi('fetchPrescription', { id })
}

export async function createPrescription(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createPrescription', { data })
}

export async function updatePrescription(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updatePrescription', { id, data })
}

export async function deletePrescription(id: string): Promise<{ success: boolean }> {
  return callApi('deletePrescription', { id })
}

// ── Setup ───────────────────────────────────────────────────────────────────

export async function fetchSetup(): Promise<Record<string, unknown>[]> {
  return callApi('fetchSetup')
}

export async function createSetup(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createSetup', { data })
}

export async function updateSetup(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updateSetup', { id, data })
}

export async function deleteSetup(id: string): Promise<{ success: boolean }> {
  return callApi('deleteSetup', { id })
}

// ── Favorite Setup ──────────────────────────────────────────────────────────

export async function fetchFavoriteSetups(): Promise<Record<string, unknown>[]> {
  return callApi('fetchFavoriteSetups')
}

export async function createFavoriteSetup(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createFavoriteSetup', { data })
}

export async function updateFavoriteSetup(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updateFavoriteSetup', { id, data })
}

export async function deleteFavoriteSetup(id: string): Promise<{ success: boolean }> {
  return callApi('deleteFavoriteSetup', { id })
}

// ── Favorite Medicine ───────────────────────────────────────────────────────

export async function fetchFavoriteMedicines(): Promise<Record<string, unknown>[]> {
  return callApi('fetchFavoriteMedicines')
}

export async function createFavoriteMedicine(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createFavoriteMedicine', { data })
}

export async function updateFavoriteMedicine(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updateFavoriteMedicine', { id, data })
}

export async function deleteFavoriteMedicine(id: string): Promise<{ success: boolean }> {
  return callApi('deleteFavoriteMedicine', { id })
}

// ── Instruction ─────────────────────────────────────────────────────────────

export async function fetchInstructions(): Promise<Record<string, unknown>[]> {
  return callApi('fetchInstructions')
}

export async function createInstruction(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createInstruction', { data })
}

export async function updateInstruction(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updateInstruction', { id, data })
}

export async function deleteInstruction(id: string): Promise<{ success: boolean }> {
  return callApi('deleteInstruction', { id })
}

// ── Route Type ──────────────────────────────────────────────────────────────

export async function fetchRouteTypes(): Promise<Record<string, unknown>[]> {
  return callApi('fetchRouteTypes')
}

export async function createRouteType(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('createRouteType', { data })
}

export async function updateRouteType(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  return callApi('updateRouteType', { id, data })
}

export async function deleteRouteType(id: string): Promise<{ success: boolean }> {
  return callApi('deleteRouteType', { id })
}

// ── Doctor Info ─────────────────────────────────────────────────────────────

export async function fetchDoctorInfo(doctorId: string): Promise<Record<string, unknown> | undefined> {
  return callApi('fetchDoctorInfo', { doctorId })
}

export async function upsertDoctorInfo(data: Record<string, unknown>): Promise<Record<string, unknown> | undefined> {
  return callApi('upsertDoctorInfo', { data })
}
