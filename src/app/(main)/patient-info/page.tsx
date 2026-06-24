"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Loader2,
  Users,
} from "lucide-react"

import PageHeader from "@/components/shared/page-header/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const

const patientSchema = yup.object({
  name: yup.string().required("Name is required"),
  age: yup.number().typeError("Must be a number").positive().integer().nullable(),
  gender: yup.string().oneOf(["Male", "Female", "Other"]).nullable(),
  phone: yup.string().nullable(),
  email: yup.string().email("Invalid email").nullable(),
  address: yup.string().nullable(),
  bloodGroup: yup.string().oneOf(bloodGroups).nullable(),
  dateOfBirth: yup.string().nullable(),
})

type PatientFormData = yup.InferType<typeof patientSchema>

interface Patient extends PatientFormData {
  id: string
  allergies: string[]
  medicationHistory: string[]
}

interface AllergyEntry {
  value: string
}

let nextId = 1

function createPatient(data: PatientFormData): Patient {
  return {
    ...data,
    id: String(nextId++),
    allergies: [],
    medicationHistory: [],
  }
}

const defaultPatientForm: PatientFormData = {
  name: "",
  age: null,
  gender: null,
  phone: "",
  email: "",
  address: "",
  bloodGroup: null,
  dateOfBirth: "",
}

function getAgeDisplay(p: Patient): string {
  if (p.age) return String(p.age)
  if (p.dateOfBirth) {
    const birth = new Date(p.dateOfBirth)
    const age = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    return String(age)
  }
  return "-"
}

export default function PatientInfoPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newAllergy, setNewAllergy] = useState("")
  const [loaded, setLoaded] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: yupResolver(patientSchema) as any,
    defaultValues: defaultPatientForm,
  })

  useEffect(() => {
    const stored = localStorage.getItem("rxpro-patients")
    if (stored) {
      try {
        const parsed: Patient[] = JSON.parse(stored)
        setPatients(parsed)
        nextId = parsed.reduce((max, p) => Math.max(max, Number(p.id)), 0) + 1
      } catch {
        // ignore
      }
    }
    setLoaded(true)
  }, [])

  const filtered = useMemo(
    () =>
      patients.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [patients, search]
  )

  function persist(updated: Patient[]) {
    setPatients(updated)
    localStorage.setItem("rxpro-patients", JSON.stringify(updated))
  }

  function openAdd() {
    setEditingPatient(null)
    reset(defaultPatientForm)
    setDialogOpen(true)
  }

  function openEdit(patient: Patient) {
    setEditingPatient(patient)
    reset({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      bloodGroup: patient.bloodGroup,
      dateOfBirth: patient.dateOfBirth,
    })
    setDialogOpen(true)
  }

  function onSave(data: PatientFormData) {
    if (editingPatient) {
      const updated = patients.map((p) =>
        p.id === editingPatient.id ? { ...p, ...data } : p
      )
      persist(updated)
    } else {
      const newP = createPatient(data)
      persist([...patients, newP])
    }
    setDialogOpen(false)
  }

  function deletePatient(id: string) {
    persist(patients.filter((p) => p.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function addAllergy(patient: Patient) {
    if (!newAllergy.trim()) return
    const updated = patients.map((p) =>
      p.id === patient.id
        ? { ...p, allergies: [...p.allergies, newAllergy.trim()] }
        : p
    )
    persist(updated)
    setNewAllergy("")
  }

  function removeAllergy(patientId: string, index: number) {
    const updated = patients.map((p) =>
      p.id === patientId
        ? { ...p, allergies: p.allergies.filter((_, i) => i !== index) }
        : p
    )
    persist(updated)
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Patient Information" description="Manage patient records">
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Add Patient
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-4">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patients by name..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Users className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No patients found. Add your first patient.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((patient) => (
                  <>
                    <TableRow
                      key={patient.id}
                      className="cursor-pointer"
                      onClick={() => toggleExpand(patient.id)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleExpand(patient.id)
                          }}
                        >
                          {expandedId === patient.id ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ChevronRight className="size-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{getAgeDisplay(patient)}</TableCell>
                      <TableCell>{patient.gender || "-"}</TableCell>
                      <TableCell>{patient.phone || "-"}</TableCell>
                      <TableCell>
                        {patient.bloodGroup ? (
                          <Badge variant="outline">{patient.bloodGroup}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEdit(patient)
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              deletePatient(patient.id)
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedId === patient.id && (
                      <TableRow key={`${patient.id}-detail`}>
                        <TableCell colSpan={7} className="bg-muted/30 p-4">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Contact Details
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-muted-foreground">Email:</span> {patient.email || "-"}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {patient.phone || "-"}</p>
                                <p><span className="text-muted-foreground">Address:</span> {patient.address || "-"}</p>
                                <p><span className="text-muted-foreground">DOB:</span> {patient.dateOfBirth || "-"}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Allergies
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {patient.allergies.length === 0 ? (
                                  <span className="text-sm text-muted-foreground">No allergies recorded</span>
                                ) : (
                                  patient.allergies.map((a, i) => (
                                    <Badge key={i} variant="secondary" className="gap-1">
                                      {a}
                                      <button
                                        onClick={() => removeAllergy(patient.id, i)}
                                        className="ml-0.5 hover:text-destructive"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    </Badge>
                                  ))
                                )}
                              </div>
                              <div className="mt-2 flex gap-2">
                                <Input
                                  placeholder="Add allergy..."
                                  className="h-7 text-xs"
                                  value={newAllergy}
                                  onChange={(e) => setNewAllergy(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault()
                                      addAllergy(patient)
                                    }
                                  }}
                                />
                                <Button
                                  size="xs"
                                  onClick={() => addAllergy(patient)}
                                >
                                  Add
                                </Button>
                              </div>
                            </div>

                            <div className="sm:col-span-2">
                              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Medication History
                              </h4>
                              {patient.medicationHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No medication history available
                                </p>
                              ) : (
                                <ul className="list-inside list-disc space-y-1 text-sm">
                                  {patient.medicationHistory.map((med, i) => (
                                    <li key={i}>{med}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add Patient"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSave as any)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" {...register("age")} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={editingPatient?.gender ?? ""}
                  onValueChange={(v) => setValue("gender", (v === "" ? null : v) as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={editingPatient?.bloodGroup ?? ""}
                  onValueChange={(v) => setValue("bloodGroup", (v === "" ? null : v) as any)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" rows={2} {...register("address")} />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit">{editingPatient ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
