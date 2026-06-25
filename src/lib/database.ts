import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { hashPassword } from './auth'

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'rxpro.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    createTables(db)
    runMigrations(db)
    seedData(db)
  }
  return db
}

const MIGRATIONS: string[] = [
  // v1: Add doctor_id to rx_patients (already in CREATE TABLE above)
  `ALTER TABLE rx_patients ADD COLUMN doctor_id TEXT REFERENCES rx_doctors(id) ON DELETE CASCADE`,
]

function runMigrations(db: Database.Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`)
  const row = db.prepare('SELECT COALESCE(MAX(version), 0) as v FROM schema_version').get() as { v: number }
  const current = row.v ?? 0
  for (let i = current; i < MIGRATIONS.length; i++) {
    db.exec(MIGRATIONS[i])
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(i + 1)
  }
}
function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS rx_doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      qualifications TEXT,
      license_number TEXT,
      security_word TEXT NOT NULL DEFAULT 'password',
      signature_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_patients (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL REFERENCES rx_doctors(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      blood_group TEXT,
      date_of_birth TEXT,
      allergies TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_patients_doctor ON rx_patients(doctor_id);

    CREATE TABLE IF NOT EXISTS rx_appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES rx_patients(id) ON DELETE CASCADE,
      doctor_id TEXT NOT NULL REFERENCES rx_doctors(id) ON DELETE CASCADE,
      appointment_date TEXT,
      appointment_time TEXT,
      status TEXT DEFAULT 'scheduled',
      reason TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES rx_patients(id),
      doctor_id TEXT NOT NULL REFERENCES rx_doctors(id),
      appointment_id TEXT REFERENCES rx_appointments(id),
      header_data TEXT DEFAULT '{}',
      complaints TEXT DEFAULT '[]',
      comorbidity TEXT DEFAULT '[]',
      examination TEXT DEFAULT '[]',
      on_examination TEXT DEFAULT '[]',
      diagnosis TEXT DEFAULT '[]',
      medications TEXT DEFAULT '[]',
      investigation TEXT DEFAULT '[]',
      on_investigation TEXT DEFAULT '[]',
      advice TEXT DEFAULT '[]',
      follow_up TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_setups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_favorite_setups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      data TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_favorite_medicines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      generic_name TEXT,
      dosage TEXT,
      instructions TEXT,
      route_type TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_instructions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_route_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rx_doctor_info (
      id TEXT PRIMARY KEY,
      doctor_id TEXT NOT NULL REFERENCES rx_doctors(id) ON DELETE CASCADE,
      clinic_name TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      license_number TEXT,
      qualifications TEXT,
      header_template TEXT,
      footer_template TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_patient ON rx_appointments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON rx_appointments(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON rx_prescriptions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON rx_prescriptions(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment ON rx_prescriptions(appointment_id);
    CREATE INDEX IF NOT EXISTS idx_doctor_info_doctor ON rx_doctor_info(doctor_id);
  `)
}

function seedData(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM rx_doctors').get() as { c: number }
  if (count.c > 0) return

  const doctorId = 'd1'

  const tx = db.transaction(() => {
    const insert = db.prepare(`
      INSERT INTO rx_doctors (id, name, email, phone, address, qualifications, license_number, security_word)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insert.run(doctorId, 'admin', 'doctor@rxpro.com', '+1-555-0100', '123 Medical Center Dr', 'MD', 'LIC-001', hashPassword('password'))

    const insertDocInfo = db.prepare(`
      INSERT INTO rx_doctor_info (id, doctor_id, clinic_name, address, phone, email, license_number, qualifications, header_template, footer_template)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insertDocInfo.run('di1', doctorId, 'RxPro Medical Clinic', '123 Medical Center Dr, Suite 100', '+1-555-0100', 'doctor@rxpro.com', 'LIC-001', 'MD - Internal Medicine',
      '[Clinic Name] | [Address] | Phone: [Phone] | License: [License #]',
      'Dr. [Doctor Name] - [Qualifications]\nThank you for your visit.'
    )

    const insertPatient = db.prepare(`
      INSERT INTO rx_patients (id, doctor_id, name, age, gender, phone, email, address, blood_group, date_of_birth, allergies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    insertPatient.run('p1', doctorId, 'John Smith', 45, 'Male', '+1-555-0101', 'john@email.com', '100 Oak St', 'A+', '1979-03-15', '["Penicillin"]')
    insertPatient.run('p2', doctorId, 'Sarah Johnson', 32, 'Female', '+1-555-0102', 'sarah@email.com', '200 Elm St', 'B-', '1992-07-22', '[]')
    insertPatient.run('p3', doctorId, 'Michael Brown', 58, 'Male', '+1-555-0103', 'michael@email.com', '300 Pine St', 'O+', '1966-11-08', '["Sulfa", "Aspirin"]')
    insertPatient.run('p4', doctorId, 'Emily Davis', 28, 'Female', '+1-555-0104', 'emily@email.com', '400 Maple Ave', 'AB+', '1996-05-30', '[]')
    insertPatient.run('p5', doctorId, 'Robert Wilson', 65, 'Male', '+1-555-0105', 'robert@email.com', '500 Cedar Ln', 'A-', '1959-09-12', '["Latex"]')

    const insertAppt = db.prepare(`
      INSERT INTO rx_appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    insertAppt.run('a1', 'p1', doctorId, '2026-06-25', '09:00', 'scheduled', 'Annual checkup')
    insertAppt.run('a2', 'p2', doctorId, '2026-06-25', '10:30', 'scheduled', 'Blood pressure follow-up')
    insertAppt.run('a3', 'p3', doctorId, '2026-06-26', '14:00', 'scheduled', 'Diabetes management')
    insertAppt.run('a4', 'p4', doctorId, '2026-06-24', '11:00', 'completed', 'Vaccination')
    insertAppt.run('a5', 'p5', doctorId, '2026-06-24', '15:30', 'completed', 'Joint pain consultation')

    const insertSetup = db.prepare(`
      INSERT INTO rx_setups (id, name, description, type) VALUES (?, ?, ?, ?)
    `)
    insertSetup.run('s1', 'General Checkup', 'Standard annual physical examination', 'Examination')
    insertSetup.run('s2', 'Blood Pressure', 'Hypertension monitoring setup', 'Vital')
    insertSetup.run('s3', 'Diabetes Monitoring', 'Blood sugar level tracking', 'Lab')

    const insertFavMed = db.prepare(`
      INSERT INTO rx_favorite_medicines (id, name, generic_name, dosage, instructions, route_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    insertFavMed.run('m1', 'Amoxicillin', 'Amoxicillin', '500mg', 'Three times daily after meals', 'Oral')
    insertFavMed.run('m2', 'Lisinopril', 'Lisinopril', '10mg', 'Once daily in the morning', 'Oral')
    insertFavMed.run('m3', 'Metformin', 'Metformin HCl', '850mg', 'Twice daily with meals', 'Oral')
    insertFavMed.run('m4', 'Atorvastatin', 'Atorvastatin', '20mg', 'Once daily at bedtime', 'Oral')
    insertFavMed.run('m5', 'Omeprazole', 'Omeprazole', '20mg', 'Once daily before breakfast', 'Oral')

    const insertInstr = db.prepare(`
      INSERT INTO rx_instructions (id, name, description) VALUES (?, ?, ?)
    `)
    insertInstr.run('i1', 'After Meals', 'Take after meals')
    insertInstr.run('i2', 'Before Meals', 'Take on empty stomach')
    insertInstr.run('i3', 'At Bedtime', 'Take before sleeping')
    insertInstr.run('i4', 'As Needed', 'Take only when required')

    const insertRoute = db.prepare(`
      INSERT INTO rx_route_types (id, name, description) VALUES (?, ?, ?)
    `)
    insertRoute.run('r1', 'Oral', 'Taken by mouth')
    insertRoute.run('r2', 'Topical', 'Applied to skin')
    insertRoute.run('r3', 'Intravenous', 'Administered through vein')
    insertRoute.run('r4', 'Intramuscular', 'Injected into muscle')
    insertRoute.run('r5', 'Subcutaneous', 'Injected under skin')

    const insertFavSetup = db.prepare(`
      INSERT INTO rx_favorite_setups (id, name, description, data) VALUES (?, ?, ?, ?)
    `)
    insertFavSetup.run('fs1', 'Hypertension Protocol', 'Standard hypertension workup', '{"examination":["Blood pressure","Heart rate"],"investigation":["ECG","Lipid profile"]}')
    insertFavSetup.run('fs2', 'Diabetes Follow-up', 'Routine diabetes monitoring', '{"examination":["Blood sugar","HbA1c"],"diagnosis":["Type 2 DM"],"advice":["Diet control","Exercise"]}')
  })

  tx()
}

export function closeDb() {
  if (db) {
    db.close()
    db = null
  }
}

export function backupDatabase(): string {
  const dbInstance = getDb()
  const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
  const filename = `rxpro-${new Date().toISOString().replace(/[:.]/g, '-')}.db`
  const backupPath = path.join(backupDir, filename)
  dbInstance.backup(backupPath)
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('rxpro-')).sort().reverse()
  for (const oldFile of files.slice(7)) fs.unlinkSync(path.join(backupDir, oldFile))
  return backupPath
}
