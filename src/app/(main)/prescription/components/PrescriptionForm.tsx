"use client"

import { useState, useCallback, useId } from "react"
import {
  useForm,
  useFieldArray,
  Controller,
  type UseFormReturn,
  type FieldArrayPath,
  type FieldPath,
  type Resolver,
  type Control,
} from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { ChevronDown, Plus, Trash2, Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useCookies } from "next-client-cookies"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useCreatePrescription } from "@/hooks/usePrescriptions"
import { useFavoriteSetups } from "@/hooks/useSetup"
import type { PrescriptionFormData } from "../types"

interface SectionState {
  complaints: boolean
  comorbidity: boolean
  examination: boolean
  onExamination: boolean
  diagnosis: boolean
  medications: boolean
  investigation: boolean
  onInvestigation: boolean
  advice: boolean
  followUp: boolean
}

type ArraySectionKey = keyof Pick<
  PrescriptionFormData,
  | "complaints"
  | "comorbidity"
  | "examination"
  | "onExamination"
  | "diagnosis"
  | "medications"
  | "investigation"
  | "onInvestigation"
  | "advice"
>

const DRUG_OPTIONS = [
  "Amoxicillin 500mg",
  "Azithromycin 250mg",
  "Cetirizine 10mg",
  "Metformin 500mg",
  "Lisinopril 10mg",
  "Amlodipine 5mg",
  "Omeprazole 20mg",
  "Paracetamol 500mg",
  "Ibuprofen 400mg",
  "Prednisolone 5mg",
]

const ROUTE_OPTIONS = [
  { value: "oral", label: "Oral" },
  { value: "iv", label: "IV" },
  { value: "im", label: "IM" },
  { value: "topical", label: "Topical" },
  { value: "sublingual", label: "Sublingual" },
  { value: "inhalation", label: "Inhalation" },
  { value: "rectal", label: "Rectal" },
]

const FREQUENCY_OPTIONS = [
  { value: "od", label: "OD (Once Daily)" },
  { value: "bid", label: "BID (Twice Daily)" },
  { value: "tid", label: "TID (Three Times Daily)" },
  { value: "qid", label: "QID (Four Times Daily)" },
  { value: "hs", label: "HS (At Bedtime)" },
  { value: "prn", label: "PRN (As Needed)" },
  { value: "stat", label: "STAT (Immediately)" },
]

const schema = yup.object({
  headerData: yup.object({
    clinicName: yup.string().required("Clinic name is required"),
    doctorName: yup.string().required("Doctor name is required"),
    address: yup.string().required("Address is required"),
    licenseNumber: yup.string().required("License number is required"),
  }),
  patientId: yup.string().required("Patient ID is required"),
  complaints: yup
    .array(
      yup.object({
        id: yup.string().required(),
        complaint: yup.string().required("Complaint is required"),
        duration: yup.string().required("Duration is required"),
      })
    )
    .required()
    .min(1, "At least one complaint is required"),
  comorbidity: yup
    .array(
      yup.object({
        id: yup.string().required(),
        condition: yup.string().required("Condition is required"),
      })
    )
    .required(),
  examination: yup
    .array(
      yup.object({
        id: yup.string().required(),
        finding: yup.string().required("Finding is required"),
        result: yup.string().required("Result is required"),
      })
    )
    .required(),
  onExamination: yup
    .array(
      yup.object({
        id: yup.string().required(),
        type: yup
          .string()
          .oneOf(["general", "systemic"])
          .required("Type is required"),
        finding: yup.string().required("Finding is required"),
      })
    )
    .required(),
  diagnosis: yup
    .array(
      yup.object({
        id: yup.string().required(),
        diagnosis: yup.string().required("Diagnosis is required"),
      })
    )
    .required(),
  medications: yup
    .array(
      yup.object({
        id: yup.string().required(),
        drugName: yup.string().required("Drug name is required"),
        dosage: yup.string().required("Dosage is required"),
        duration: yup.string().required("Duration is required"),
        instructions: yup.string().required(),
        routeType: yup.string().required("Route type is required"),
        frequency: yup.string().required("Frequency is required"),
      })
    )
    .required(),
  investigation: yup
    .array(
      yup.object({
        id: yup.string().required(),
        testName: yup.string().required("Test name is required"),
        notes: yup.string().required(),
      })
    )
    .required(),
  onInvestigation: yup
    .array(
      yup.object({
        id: yup.string().required(),
        testName: yup.string().required("Test name is required"),
        notes: yup.string().required(),
      })
    )
    .required(),
  advice: yup
    .array(
      yup.object({
        id: yup.string().required(),
        advice: yup.string().required("Advice is required"),
      })
    )
    .required(),
  followUp: yup.object({
    date: yup.string().required(),
    notes: yup.string().required(),
  }),
})

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const defaultValues: PrescriptionFormData = {
  headerData: {
    clinicName: "",
    doctorName: "",
    address: "",
    licenseNumber: "",
  },
  patientId: "",
  complaints: [{ id: generateId(), complaint: "", duration: "" }],
  comorbidity: [],
  examination: [],
  onExamination: [],
  diagnosis: [],
  medications: [],
  investigation: [],
  onInvestigation: [],
  advice: [],
  followUp: { date: "", notes: "" },
}

const sectionLabels: Record<ArraySectionKey | "followUp", string> = {
  complaints: "Complaints",
  comorbidity: "Comorbidity",
  examination: "Examination",
  onExamination: "On Examination",
  diagnosis: "Diagnosis",
  medications: "Medications",
  investigation: "Investigation",
  onInvestigation: "On Investigation",
  advice: "Advice",
  followUp: "Follow Up",
}

const defaultNewItem: Record<
  ArraySectionKey,
  Record<string, string>
> = {
  complaints: { complaint: "", duration: "" },
  comorbidity: { condition: "" },
  examination: { finding: "", result: "" },
  onExamination: { type: "general", finding: "" },
  diagnosis: { diagnosis: "" },
  medications: {
    drugName: "",
    dosage: "",
    duration: "",
    instructions: "",
    routeType: "",
    frequency: "",
  },
  investigation: { testName: "", notes: "" },
  onInvestigation: { testName: "", notes: "" },
  advice: { advice: "" },
}

interface CollapsibleCardProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}

function CollapsibleCard({
  title,
  isOpen,
  onToggle,
  children,
}: CollapsibleCardProps) {
  const contentId = useId()

  return (
    <Card>
      <CardHeader
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={contentId}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${title} section`}
        onClick={onToggle}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onToggle()
          }
        }}
        className={cn(
          "flex cursor-pointer flex-row items-center justify-between select-none",
          isOpen && "border-b"
        )}
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </CardHeader>
      {isOpen && (
        <CardContent
          id={contentId}
          role="region"
          aria-label={`${title} content`}
        >
          {children}
        </CardContent>
      )}
    </Card>
  )
}

interface ArraySectionField {
  name: string
  label: string
  type: "text" | "select" | "textarea"
  placeholder?: string
  options?: { value: string; label: string }[]
}

const arraySectionFields: Record<ArraySectionKey, ArraySectionField[]> = {
  complaints: [
    { name: "complaint", label: "Complaint", type: "text", placeholder: "e.g. Headache" },
    { name: "duration", label: "Duration", type: "text", placeholder: "e.g. 3 days" },
  ],
  comorbidity: [
    { name: "condition", label: "Condition", type: "text", placeholder: "e.g. Diabetes" },
  ],
  examination: [
    { name: "finding", label: "Finding", type: "text", placeholder: "e.g. BP" },
    { name: "result", label: "Result", type: "text", placeholder: "e.g. 120/80" },
  ],
  onExamination: [
    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "general", label: "General" },
        { value: "systemic", label: "Systemic" },
      ],
    },
    { name: "finding", label: "Finding", type: "textarea", placeholder: "e.g. Pulse 72 bpm" },
  ],
  diagnosis: [
    { name: "diagnosis", label: "Diagnosis", type: "text", placeholder: "e.g. Hypertension" },
  ],
  medications: [
    { name: "drugName", label: "Drug Name", type: "text", placeholder: "Search drug..." },
    { name: "dosage", label: "Dosage", type: "text", placeholder: "e.g. 500mg" },
    {
      name: "routeType",
      label: "Route",
      type: "select",
      options: ROUTE_OPTIONS,
    },
    {
      name: "frequency",
      label: "Frequency",
      type: "select",
      options: FREQUENCY_OPTIONS,
    },
    { name: "duration", label: "Duration", type: "text", placeholder: "e.g. 7 days" },
    { name: "instructions", label: "Instructions", type: "textarea", placeholder: "e.g. Take after meals" },
  ],
  investigation: [
    { name: "testName", label: "Test Name", type: "text", placeholder: "e.g. CBC" },
    { name: "notes", label: "Notes", type: "text", placeholder: "e.g. Fasting required" },
  ],
  onInvestigation: [
    { name: "testName", label: "Test Name", type: "text", placeholder: "e.g. ECG" },
    { name: "notes", label: "Notes", type: "text", placeholder: "e.g. Previous report available" },
  ],
  advice: [
    { name: "advice", label: "Advice", type: "textarea", placeholder: "e.g. Follow BRAT diet" },
  ],
}

interface ArraySectionProps {
  sectionKey: ArraySectionKey
  control: Control<PrescriptionFormData>
  register: UseFormReturn<PrescriptionFormData>["register"]
}

function ArraySection({ sectionKey, control, register }: ArraySectionProps) {
  const name = sectionKey as FieldArrayPath<PrescriptionFormData>
  const { fields, append, remove } = useFieldArray({ control, name })
  const fieldsConfig = arraySectionFields[sectionKey]
  const defaultItem = defaultNewItem[sectionKey]

  const handleAdd = useCallback(() => {
    append({ id: generateId(), ...defaultItem } as never)
  }, [append, defaultItem])

  const handleRemove = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove]
  )

  const isMedication = sectionKey === "medications"

  return (
    <div className="space-y-3">
      {fields.map((field, index) => {
        const fieldId = (field as { id: string }).id
        return (
          <div key={fieldId} className="relative rounded-lg border p-3 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {sectionLabels[sectionKey]} #{index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${sectionLabels[sectionKey].toLowerCase()} item ${index + 1}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {fieldsConfig.map((fieldConfig) => {
                const fieldName = `${sectionKey}.${index}.${fieldConfig.name}` as FieldPath<PrescriptionFormData>

                if (fieldConfig.type === "select") {
                  return (
                    <div key={fieldConfig.name}>
                      <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
                      <Controller
                        name={fieldName}
                        control={control}
                        render={({ field: controllerField }) => (
                          <Select
                            value={String(controllerField.value ?? "")}
                            onValueChange={(val) => {
                              controllerField.onChange(val)
                            }}
                          >
                            <SelectTrigger
                              id={fieldName}
                              aria-label={fieldConfig.label}
                            >
                              <SelectValue
                                placeholder={`Select ${fieldConfig.label}`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldConfig.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )
                }

                if (fieldConfig.type === "textarea") {
                  return (
                    <div
                      key={fieldConfig.name}
                      className={
                        fieldsConfig.length === 1 || isMedication
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
                      <Textarea
                        id={fieldName}
                        {...register(fieldName)}
                        placeholder={fieldConfig.placeholder}
                        aria-label={fieldConfig.label}
                        rows={2}
                      />
                    </div>
                  )
                }

                return (
                  <div
                    key={fieldConfig.name}
                    className={
                      fieldsConfig.length === 1 ? "sm:col-span-2" : ""
                    }
                  >
                    <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
                    {isMedication && fieldConfig.name === "drugName" ? (
                      <>
                        <Input
                          id={fieldName}
                          {...register(fieldName)}
                          placeholder={fieldConfig.placeholder}
                          aria-label={fieldConfig.label}
                          list="drug-suggestions"
                        />
                        <datalist id="drug-suggestions">
                          {DRUG_OPTIONS.map((drug) => (
                            <option key={drug} value={drug} />
                          ))}
                        </datalist>
                      </>
                    ) : (
                      <Input
                        id={fieldName}
                        {...register(fieldName)}
                        placeholder={fieldConfig.placeholder}
                        aria-label={fieldConfig.label}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        aria-label={`Add ${sectionLabels[sectionKey].toLowerCase()} item`}
      >
        <Plus className="size-4" />
        Add {sectionLabels[sectionKey]}
      </Button>
    </div>
  )
}

interface PrescriptionFormProps {
  onPrint?: (data: PrescriptionFormData) => void
}

export default function PrescriptionForm({
  onPrint,
}: PrescriptionFormProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")

  const { data: favoriteSetups, isLoading: isLoadingTemplates } = useFavoriteSetups()

  const [sections, setSections] = useState<SectionState>({
    complaints: true,
    comorbidity: false,
    examination: false,
    onExamination: false,
    diagnosis: false,
    medications: false,
    investigation: false,
    onInvestigation: false,
    advice: false,
    followUp: false,
  })

  const resolver = yupResolver(schema) as unknown as Resolver<PrescriptionFormData>

  const cookies = useCookies()
  const createPrescription = useCreatePrescription()

  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormData>({
    resolver,
    defaultValues,
    mode: "onChange",
  })

  const toggleSection = useCallback((section: keyof SectionState) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }, [])

  const handleLoadTemplate = useCallback(() => {
    if (!selectedTemplateId) return
    const template = (favoriteSetups as Record<string, unknown>[] | undefined)?.find(
      (f) => f.id === selectedTemplateId
    )
    if (!template) return

    let parsedData: Record<string, string[]> = {}
    try {
      parsedData =
        typeof template.data === "string"
          ? JSON.parse(template.data)
          : (template.data as Record<string, string[]>)
    } catch {
      toast.error("Invalid template data")
      return
    }

    if (parsedData.complaints?.length) {
      setValue(
        "complaints",
        parsedData.complaints.map((item: string) => ({
          id: generateId(),
          complaint: item,
          duration: "",
        }))
      )
    }
    if (parsedData.examination?.length) {
      setValue(
        "examination",
        parsedData.examination.map((item: string) => ({
          id: generateId(),
          finding: item,
          result: "",
        }))
      )
    }
    if (parsedData.investigation?.length) {
      setValue(
        "investigation",
        parsedData.investigation.map((item: string) => ({
          id: generateId(),
          testName: item,
          notes: "",
        }))
      )
    }
    if (parsedData.diagnosis?.length) {
      setValue(
        "diagnosis",
        parsedData.diagnosis.map((item: string) => ({
          id: generateId(),
          diagnosis: item,
        }))
      )
    }
    if (parsedData.advice?.length) {
      setValue(
        "advice",
        parsedData.advice.map((item: string) => ({
          id: generateId(),
          advice: item,
        }))
      )
    }
    if (parsedData.medications?.length) {
      setValue(
        "medications",
        parsedData.medications.map((item: string) => ({
          id: generateId(),
          drugName: item,
          dosage: "",
          duration: "",
          instructions: "",
          routeType: "",
          frequency: "",
        }))
      )
    }

    toast.success("Template loaded")
  }, [selectedTemplateId, favoriteSetups, setValue])

  const handleFormSubmit = useCallback(
    (data: PrescriptionFormData) => {
      const doctorId = cookies.get("doctor_id") || "d1"
      const payload = {
        patient_id: data.patientId,
        doctor_id: doctorId,
        header_data: data.headerData,
        complaints: data.complaints,
        comorbidity: data.comorbidity,
        examination: data.examination,
        on_examination: data.onExamination,
        diagnosis: data.diagnosis,
        medications: data.medications,
        investigation: data.investigation,
        on_investigation: data.onInvestigation,
        advice: data.advice,
        follow_up: data.followUp,
      } satisfies Record<string, unknown>
      createPrescription.mutate(payload, {
        onSuccess: () => {
          toast.success("Prescription saved successfully")
          reset()
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save prescription")
        },
      })
    },
    [cookies, createPrescription, reset]
  )

  const arraySectionKeys: ArraySectionKey[] = [
    "complaints",
    "comorbidity",
    "examination",
    "onExamination",
    "diagnosis",
    "medications",
    "investigation",
    "onInvestigation",
    "advice",
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Header Data Section */}
      <Card>
        <CardHeader className="border-b">
          <span className="text-sm font-medium">Header Data</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="headerData.clinicName">Clinic Name</Label>
              <Input
                id="headerData.clinicName"
                {...register("headerData.clinicName")}
                placeholder="e.g. City Health Clinic"
                aria-label="Clinic name"
              />
              {errors.headerData?.clinicName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.headerData.clinicName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="headerData.doctorName">Doctor Name</Label>
              <Input
                id="headerData.doctorName"
                {...register("headerData.doctorName")}
                placeholder="e.g. Dr. Smith"
                aria-label="Doctor name"
              />
              {errors.headerData?.doctorName && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.headerData.doctorName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="headerData.address">Address</Label>
              <Input
                id="headerData.address"
                {...register("headerData.address")}
                placeholder="e.g. 123 Main St"
                aria-label="Clinic address"
              />
              {errors.headerData?.address && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.headerData.address.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="headerData.licenseNumber">
                License Number
              </Label>
              <Input
                id="headerData.licenseNumber"
                {...register("headerData.licenseNumber")}
                placeholder="e.g. LIC-12345"
                aria-label="License number"
              />
              {errors.headerData?.licenseNumber && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.headerData.licenseNumber.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient ID Section */}
      <Card>
        <CardHeader className="border-b">
          <span className="text-sm font-medium">Patient</span>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              {...register("patientId")}
              placeholder="e.g. PAT-001"
              aria-label="Patient ID"
            />
            {errors.patientId && (
              <p className="mt-1 text-xs text-destructive">
                {errors.patientId.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Load Template */}
      <Card>
        <CardHeader className="border-b">
          <span className="text-sm font-medium">Load Template</span>
        </CardHeader>
        <CardContent>
          {isLoadingTemplates ? (
            <Loader2 className="size-4 animate-spin" />
          ) : !favoriteSetups || (favoriteSetups as Record<string, unknown>[]).length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates available</p>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="template-select">Favorite Setup</Label>
                <Select value={selectedTemplateId} onValueChange={(val) => setSelectedTemplateId(val ?? "")}>
                  <SelectTrigger id="template-select" aria-label="Select a favorite setup">
                    <SelectValue placeholder="Select a favorite setup" />
                  </SelectTrigger>
                  <SelectContent>
                    {(favoriteSetups as Record<string, unknown>[]).map((setup) => (
                      <SelectItem key={setup.id as string} value={setup.id as string}>
                        {setup.name as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleLoadTemplate}
                disabled={!selectedTemplateId}
                aria-label="Apply template"
              >
                Apply Template
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dynamic Array Sections */}
      {arraySectionKeys.map((sectionKey) => (
        <CollapsibleCard
          key={sectionKey}
          title={sectionLabels[sectionKey]}
          isOpen={sections[sectionKey]}
          onToggle={() => toggleSection(sectionKey)}
        >
          <ArraySection
            sectionKey={sectionKey}
            control={control}
            register={register}
          />
        </CollapsibleCard>
      ))}

      {/* Follow Up Section */}
      <CollapsibleCard
        title="Follow Up"
        isOpen={sections.followUp}
        onToggle={() => toggleSection("followUp")}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="followUp.date">Date</Label>
            <Input
              id="followUp.date"
              type="date"
              {...register("followUp.date")}
              aria-label="Follow up date"
            />
          </div>
          <div>
            <Label htmlFor="followUp.notes">Notes</Label>
            <Input
              id="followUp.notes"
              {...register("followUp.notes")}
              placeholder="e.g. Review blood work"
              aria-label="Follow up notes"
            />
          </div>
        </div>
      </CollapsibleCard>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          aria-label="Save prescription"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Save Prescription
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onPrint?.(watch())}
          aria-label="Preview prescription"
        >
          <Printer className="size-4" />
          Preview
        </Button>
      </div>
    </form>
  )
}
