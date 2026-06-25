import type { PrescriptionFormData, HeaderData, Complaint, ComorbidityItem, ExaminationItem, OnExaminationItem, DiagnosisItem, MedicationItem, InvestigationItem, AdviceItem, FollowUp } from "@/app/(main)/prescription/types"

function normalizeHeaderData(hd: Record<string, unknown> | null | undefined): HeaderData {
  if (!hd) return { clinicName: "", doctorName: "", address: "", licenseNumber: "" }
  return {
    clinicName: (hd.clinicName as string) ?? (hd.clinic_name as string) ?? "",
    doctorName: (hd.doctorName as string) ?? (hd.doctor_name as string) ?? "",
    address: (hd.address as string) ?? "",
    licenseNumber: (hd.licenseNumber as string) ?? (hd.license_number as string) ?? "",
  }
}

function normalizeArray<T>(val: unknown): T[] {
  if (Array.isArray(val)) return val as T[]
  return []
}

function normalizeFollowUp(val: unknown): FollowUp {
  const fu = val as Record<string, string> | null | undefined
  return {
    date: fu?.date ?? "",
    notes: fu?.notes ?? "",
  }
}

/**
 * Converts a DAL prescription record (snake_case keys, parsed JSON fields) to PrescriptionFormData (camelCase).
 */
export function dalRecordToPrescriptionFormData(record: Record<string, unknown>): PrescriptionFormData {
  return {
    headerData: normalizeHeaderData(record.header_data as Record<string, unknown> | null | undefined),
    patientId: (record.patient_id as string) ?? "",
    complaints: normalizeArray<Complaint>(record.complaints),
    comorbidity: normalizeArray<ComorbidityItem>(record.comorbidity),
    examination: normalizeArray<ExaminationItem>(record.examination),
    onExamination: normalizeArray<OnExaminationItem>(record.on_examination),
    diagnosis: normalizeArray<DiagnosisItem>(record.diagnosis),
    medications: normalizeArray<MedicationItem>(record.medications),
    investigation: normalizeArray<InvestigationItem>(record.investigation),
    onInvestigation: normalizeArray<InvestigationItem>(record.on_investigation),
    advice: normalizeArray<AdviceItem>(record.advice),
    followUp: normalizeFollowUp(record.follow_up),
  }
}
