export type LoginCredentials = {
  name: string
  securityWord: string
}

export type AuthResponse = {
  doctor_id: string
  token: string
}

export type PaginationState = {
  page: number
  pageSize: number
}

export type Complaint = {
  id: string
  complaint: string
  duration: string
}

export type Comorbidity = {
  id: string
  condition: string
  notes: string
}

export type Examination = {
  id: string
  type: string
  finding: string
}

export type OnExamination = {
  id: string
  parameter: string
  value: string
}

export type Diagnosis = {
  id: string
  diagnosis: string
  type: string
}

export type Medication = {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  route: string
  instructions: string
}

export type Investigation = {
  id: string
  test: string
  notes: string
}

export type OnInvestigation = {
  id: string
  parameter: string
  value: string
}

export type Advice = {
  id: string
  advice: string
}

export type FollowUp = {
  id: string
  follow_up: string
  date: string
}
