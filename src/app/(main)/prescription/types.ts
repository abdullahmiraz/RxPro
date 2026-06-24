export interface Complaint { id: string; complaint: string; duration: string }

export interface ComorbidityItem { id: string; condition: string }

export interface ExaminationItem { id: string; finding: string; result: string }

export interface OnExaminationItem { id: string; type: "general" | "systemic"; finding: string }

export interface DiagnosisItem { id: string; diagnosis: string }

export interface MedicationItem {
  id: string
  drugName: string
  dosage: string
  duration: string
  instructions: string
  routeType: string
  frequency: string
}

export interface InvestigationItem { id: string; testName: string; notes: string }

export interface AdviceItem { id: string; advice: string }

export interface FollowUp { date: string; notes: string }

export interface HeaderData {
  clinicName: string
  doctorName: string
  address: string
  licenseNumber: string
}

export interface PrescriptionFormData {
  headerData: HeaderData
  patientId: string
  complaints: Complaint[]
  comorbidity: ComorbidityItem[]
  examination: ExaminationItem[]
  onExamination: OnExaminationItem[]
  diagnosis: DiagnosisItem[]
  medications: MedicationItem[]
  investigation: InvestigationItem[]
  onInvestigation: InvestigationItem[]
  advice: AdviceItem[]
  followUp: FollowUp
}
