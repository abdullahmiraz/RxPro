import { getDb } from './database'
import crypto from 'crypto'
import { verifyPassword } from './auth'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function rows<T>(data: T[]): T[] {
  return data
}

function parseJson(val: string | null | undefined): unknown {
  if (!val) return null
  try { return JSON.parse(val) } catch { return val }
}

function toJson<T>(val: T): string {
  if (typeof val === 'string') return val
  return JSON.stringify(val)
}

export function fetchDoctor(doctorId: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM rx_doctors WHERE id = ?').get(doctorId) as Record<string, unknown> | undefined
}

export function fetchDoctorByCredentials(name: string, securityWord: string) {
  const db = getDb()
  const doctor = db.prepare('SELECT * FROM rx_doctors WHERE name = ?').get(name) as Record<string, unknown> | undefined
  if (!doctor) return undefined
  const hash = doctor.security_word as string
  if (!hash || !verifyPassword(securityWord, hash)) return undefined
  return doctor
}

export function fetchPatients(doctorId?: string, limit?: number, offset?: number) {
  const db = getDb()
  let sql = doctorId
    ? 'SELECT * FROM rx_patients WHERE doctor_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM rx_patients ORDER BY created_at DESC'
  const params: (string | number)[] = doctorId ? [doctorId] : []
  if (limit !== undefined) {
    sql += ' LIMIT ?'
    params.push(limit)
    if (offset !== undefined) {
      sql += ' OFFSET ?'
      params.push(offset)
    }
  }
  const patients = rows((params.length > 0 ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as Record<string, unknown>[])
  for (const patient of patients) {
    patient.allergies = parseJson(patient.allergies as string)
  }
  return patients
}

export function fetchPatient(id: string, doctorId?: string) {
  const db = getDb()
  const sql = doctorId
    ? 'SELECT * FROM rx_patients WHERE id = ? AND doctor_id = ?'
    : 'SELECT * FROM rx_patients WHERE id = ?'
  const patient = (doctorId ? db.prepare(sql).get(id, doctorId) : db.prepare(sql).get(id)) as Record<string, unknown> | undefined
  if (patient) {
    patient.allergies = parseJson(patient.allergies as string)
  }
  return patient
}

export function createPatient(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare(`
    INSERT INTO rx_patients (id, doctor_id, name, age, gender, phone, email, address, blood_group, date_of_birth, allergies, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.doctor_id ?? null,
    data.name ?? null,
    data.age ?? null,
    data.gender ?? null,
    data.phone ?? null,
    data.email ?? null,
    data.address ?? null,
    data.blood_group ?? null,
    data.date_of_birth ?? null,
    toJson(data.allergies ?? '[]'),
    timestamp,
    timestamp
  )
  return fetchPatient(id)
}

export function updatePatient(id: string, data: Record<string, unknown>, doctorId?: string) {
  const db = getDb()
  const timestamp = now()
  const existing = doctorId ? fetchPatient(id, doctorId) : fetchPatient(id)
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare(`
    UPDATE rx_patients SET name=?, age=?, gender=?, phone=?, email=?, address=?, blood_group=?, date_of_birth=?, allergies=?, updated_at=?
    WHERE id=?
  `).run(
    merged.name,
    merged.age,
    merged.gender,
    merged.phone,
    merged.email,
    merged.address,
    merged.blood_group,
    merged.date_of_birth,
    toJson(merged.allergies ?? '[]'),
    merged.updated_at,
    id
  )
  return fetchPatient(id)
}

export function deletePatient(id: string, doctorId?: string) {
  const db = getDb()
  const sql = doctorId
    ? 'DELETE FROM rx_patients WHERE id = ? AND doctor_id = ?'
    : 'DELETE FROM rx_patients WHERE id = ?'
  ;(doctorId ? db.prepare(sql).run(id, doctorId) : db.prepare(sql).run(id))
  return { success: true }
}

export function fetchAppointments(doctorId: string) {
  const db = getDb()
  return rows(db.prepare(`
    SELECT a.*, p.name as patient_name
    FROM rx_appointments a
    LEFT JOIN rx_patients p ON a.patient_id = p.id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all(doctorId) as Record<string, unknown>[])
}

export function fetchAppointment(id: string) {
  const db = getDb()
  return db.prepare(`
    SELECT a.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender, p.phone as patient_phone
    FROM rx_appointments a
    LEFT JOIN rx_patients p ON a.patient_id = p.id
    WHERE a.id = ?
  `).get(id) as Record<string, unknown> | undefined
}

export function createAppointment(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare(`
    INSERT INTO rx_appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.patient_id ?? null,
    data.doctor_id ?? null,
    data.appointment_date ?? null,
    data.appointment_time ?? null,
    data.status ?? 'scheduled',
    data.reason ?? null,
    data.notes ?? null,
    timestamp,
    timestamp
  )
  return fetchAppointment(id)
}

export function updateAppointment(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_appointments WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare(`
    UPDATE rx_appointments SET patient_id=?, doctor_id=?, appointment_date=?, appointment_time=?, status=?, reason=?, notes=?, updated_at=?
    WHERE id=?
  `).run(
    merged.patient_id,
    merged.doctor_id,
    merged.appointment_date,
    merged.appointment_time,
    merged.status,
    merged.reason,
    merged.notes,
    merged.updated_at,
    id
  )
  return fetchAppointment(id)
}

export function deleteAppointment(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_appointments WHERE id = ?').run(id)
  return { success: true }
}

export function fetchPrescriptions(doctorId: string) {
  const db = getDb()
  return rows(db.prepare(`
    SELECT pr.*, p.name as patient_name
    FROM rx_prescriptions pr
    LEFT JOIN rx_patients p ON pr.patient_id = p.id
    WHERE pr.doctor_id = ?
    ORDER BY pr.created_at DESC
  `).all(doctorId) as Record<string, unknown>[])
}

export function fetchPrescription(id: string) {
  const db = getDb()
  const presc = db.prepare(`
    SELECT pr.*, p.name as patient_name, p.age as patient_age, p.gender as patient_gender
    FROM rx_prescriptions pr
    LEFT JOIN rx_patients p ON pr.patient_id = p.id
    WHERE pr.id = ?
  `).get(id) as Record<string, unknown> | undefined
  if (!presc) return undefined
  for (const field of ['header_data', 'complaints', 'comorbidity', 'examination', 'on_examination', 'diagnosis', 'medications', 'investigation', 'on_investigation', 'advice', 'follow_up']) {
    presc[field] = parseJson(presc[field] as string)
  }
  return presc
}

export function createPrescription(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare(`
    INSERT INTO rx_prescriptions (id, patient_id, doctor_id, appointment_id, header_data, complaints, comorbidity, examination, on_examination, diagnosis, medications, investigation, on_investigation, advice, follow_up, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.patient_id ?? null,
    data.doctor_id ?? null,
    data.appointment_id ?? null,
    toJson(data.header_data ?? '{}'),
    toJson(data.complaints ?? '[]'),
    toJson(data.comorbidity ?? '[]'),
    toJson(data.examination ?? '[]'),
    toJson(data.on_examination ?? '[]'),
    toJson(data.diagnosis ?? '[]'),
    toJson(data.medications ?? '[]'),
    toJson(data.investigation ?? '[]'),
    toJson(data.on_investigation ?? '[]'),
    toJson(data.advice ?? '[]'),
    toJson(data.follow_up ?? '{}'),
    timestamp,
    timestamp
  )
  return fetchPrescription(id)
}

export function updatePrescription(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_prescriptions WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare(`
    UPDATE rx_prescriptions SET patient_id=?, doctor_id=?, appointment_id=?, header_data=?, complaints=?, comorbidity=?, examination=?, on_examination=?, diagnosis=?, medications=?, investigation=?, on_investigation=?, advice=?, follow_up=?, updated_at=?
    WHERE id=?
  `).run(
    merged.patient_id,
    merged.doctor_id,
    merged.appointment_id,
    toJson(merged.header_data ?? '{}'),
    toJson(merged.complaints ?? '[]'),
    toJson(merged.comorbidity ?? '[]'),
    toJson(merged.examination ?? '[]'),
    toJson(merged.on_examination ?? '[]'),
    toJson(merged.diagnosis ?? '[]'),
    toJson(merged.medications ?? '[]'),
    toJson(merged.investigation ?? '[]'),
    toJson(merged.on_investigation ?? '[]'),
    toJson(merged.advice ?? '[]'),
    toJson(merged.follow_up ?? '{}'),
    timestamp,
    id
  )
  return fetchPrescription(id)
}

export function deletePrescription(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_prescriptions WHERE id = ?').run(id)
  return { success: true }
}

export function fetchSetup() {
  const db = getDb()
  return rows(db.prepare('SELECT * FROM rx_setups ORDER BY created_at DESC').all() as Record<string, unknown>[])
}

export function createSetup(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare(`
    INSERT INTO rx_setups (id, name, description, type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.name ?? null, data.description ?? null, data.type ?? null, timestamp, timestamp)
  return db.prepare('SELECT * FROM rx_setups WHERE id = ?').get(id)
}

export function updateSetup(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_setups WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare('UPDATE rx_setups SET name=?, description=?, type=?, updated_at=? WHERE id=?')
    .run(merged.name, merged.description, merged.type, timestamp, id)
  return db.prepare('SELECT * FROM rx_setups WHERE id = ?').get(id)
}

export function deleteSetup(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_setups WHERE id = ?').run(id)
  return { success: true }
}

export function fetchFavoriteSetups() {
  const db = getDb()
  return rows(db.prepare('SELECT * FROM rx_favorite_setups ORDER BY created_at DESC').all() as Record<string, unknown>[])
}

export function createFavoriteSetup(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare(`
    INSERT INTO rx_favorite_setups (id, name, description, data, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, data.name ?? null, data.description ?? null, toJson(data.data ?? '{}'), timestamp, timestamp)
  return db.prepare('SELECT * FROM rx_favorite_setups WHERE id = ?').get(id)
}

export function updateFavoriteSetup(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_favorite_setups WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare('UPDATE rx_favorite_setups SET name=?, description=?, data=?, updated_at=? WHERE id=?')
    .run(merged.name, merged.description, toJson(merged.data ?? '{}'), timestamp, id)
  return db.prepare('SELECT * FROM rx_favorite_setups WHERE id = ?').get(id)
}

export function deleteFavoriteSetup(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_favorite_setups WHERE id = ?').run(id)
  return { success: true }
}

export function fetchFavoriteMedicines() {
  const db = getDb()
  return rows(db.prepare('SELECT * FROM rx_favorite_medicines ORDER BY created_at DESC').all() as Record<string, unknown>[])
}

export function createFavoriteMedicine(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare(`
    INSERT INTO rx_favorite_medicines (id, name, generic_name, dosage, instructions, route_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.name ?? null, data.generic_name ?? null, data.dosage ?? null, data.instructions ?? null, data.route_type ?? null, timestamp, timestamp)
  return db.prepare('SELECT * FROM rx_favorite_medicines WHERE id = ?').get(id)
}

export function updateFavoriteMedicine(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_favorite_medicines WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare('UPDATE rx_favorite_medicines SET name=?, generic_name=?, dosage=?, instructions=?, route_type=?, updated_at=? WHERE id=?')
    .run(merged.name, merged.generic_name, merged.dosage, merged.instructions, merged.route_type, timestamp, id)
  return db.prepare('SELECT * FROM rx_favorite_medicines WHERE id = ?').get(id)
}

export function deleteFavoriteMedicine(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_favorite_medicines WHERE id = ?').run(id)
  return { success: true }
}

export function fetchInstructions() {
  const db = getDb()
  return rows(db.prepare('SELECT * FROM rx_instructions ORDER BY created_at DESC').all() as Record<string, unknown>[])
}

export function createInstruction(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare('INSERT INTO rx_instructions (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, data.name ?? null, data.description ?? null, timestamp, timestamp)
  return db.prepare('SELECT * FROM rx_instructions WHERE id = ?').get(id)
}

export function updateInstruction(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_instructions WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare('UPDATE rx_instructions SET name=?, description=?, updated_at=? WHERE id=?')
    .run(merged.name, merged.description, timestamp, id)
  return db.prepare('SELECT * FROM rx_instructions WHERE id = ?').get(id)
}

export function deleteInstruction(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_instructions WHERE id = ?').run(id)
  return { success: true }
}

export function fetchRouteTypes() {
  const db = getDb()
  return rows(db.prepare('SELECT * FROM rx_route_types ORDER BY created_at DESC').all() as Record<string, unknown>[])
}

export function createRouteType(data: Record<string, unknown>) {
  const db = getDb()
  const id = generateId()
  const timestamp = now()
  db.prepare('INSERT INTO rx_route_types (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, data.name ?? null, data.description ?? null, timestamp, timestamp)
  return db.prepare('SELECT * FROM rx_route_types WHERE id = ?').get(id)
}

export function updateRouteType(id: string, data: Record<string, unknown>) {
  const db = getDb()
  const timestamp = now()
  const existing = db.prepare('SELECT * FROM rx_route_types WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return null
  const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
  db.prepare('UPDATE rx_route_types SET name=?, description=?, updated_at=? WHERE id=?')
    .run(merged.name, merged.description, timestamp, id)
  return db.prepare('SELECT * FROM rx_route_types WHERE id = ?').get(id)
}

export function deleteRouteType(id: string) {
  const db = getDb()
  db.prepare('DELETE FROM rx_route_types WHERE id = ?').run(id)
  return { success: true }
}

export function fetchDoctorInfo(doctorId: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM rx_doctor_info WHERE doctor_id = ?').get(doctorId) as Record<string, unknown> | undefined
}

export function upsertDoctorInfo(data: Record<string, unknown>) {
  const db = getDb()
  const existing = data.id
    ? db.prepare('SELECT * FROM rx_doctor_info WHERE id = ?').get(data.id) as Record<string, unknown> | undefined
    : db.prepare('SELECT * FROM rx_doctor_info WHERE doctor_id = ?').get(data.doctor_id) as Record<string, unknown> | undefined
  const timestamp = now()
  if (existing) {
    const merged: Record<string, unknown> = { ...existing, ...data, updated_at: timestamp }
    db.prepare(`
      UPDATE rx_doctor_info SET clinic_name=?, address=?, phone=?, email=?, license_number=?, qualifications=?, header_template=?, footer_template=?, updated_at=?
      WHERE id=?
    `).run(merged.clinic_name, merged.address, merged.phone, merged.email, merged.license_number, merged.qualifications, merged.header_template, merged.footer_template, timestamp, existing.id)
    return db.prepare('SELECT * FROM rx_doctor_info WHERE id = ?').get(existing.id)
  } else {
    const id = data.id as string || generateId()
    db.prepare(`
      INSERT INTO rx_doctor_info (id, doctor_id, clinic_name, address, phone, email, license_number, qualifications, header_template, footer_template, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.doctor_id ?? null, data.clinic_name ?? null, data.address ?? null, data.phone ?? null, data.email ?? null, data.license_number ?? null, data.qualifications ?? null, data.header_template ?? null, data.footer_template ?? null, timestamp, timestamp)
    return db.prepare('SELECT * FROM rx_doctor_info WHERE id = ?').get(id)
  }
}
