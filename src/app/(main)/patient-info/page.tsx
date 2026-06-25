"use client"

import { useState, useMemo, useEffect, Fragment, useDeferredValue } from "react"
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
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from "@/hooks/usePatients"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const

const patientSchema = yup.object({
  name: yup.string().required("Name is required"),
  age: yup.number().typeError("Must be a number").positive().integer().max(150, "Max age is 150").nullable(),
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
  const router = useRouter()
  const { data: patients, isLoading } = usePatients()
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()
  const deleteMutation = useDeletePatient()

  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newAllergy, setNewAllergy] = useState("")

  useEffect(() => {
    setNewAllergy("")
  }, [expandedId])

  const cachedAllergies = useMemo(() => new Map<string, string[]>(), [])
  const cachedMedHistory = useMemo(() => new Map<string, string[]>(), [])

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

  const patientList = (patients ?? []) as unknown as Patient[]

  const filtered = useMemo(
    () =>
      patientList.filter((p) =>
        p.name.toLowerCase().includes(deferredSearch.toLowerCase())
      ),
    [patientList, deferredSearch]
  )

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedPatients = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [deferredSearch])

  function getPatientWithExtras(p: Patient): Patient {
    return {
      ...p,
      allergies: cachedAllergies.get(p.id) ?? (p as unknown as Record<string, unknown>).allergies as string[] ?? [],
      medicationHistory: cachedMedHistory.get(p.id) ?? (p as unknown as Record<string, unknown>).medicationHistory as string[] ?? [],
    }
  }

  function openAdd() {
    setEditingPatient(null)
    reset(defaultPatientForm)
    setDialogOpen(true)
  }

  function openEdit(patient: Patient) {
    setEditingPatient(patient)
    const p = getPatientWithExtras(patient)
    cachedAllergies.set(patient.id, p.allergies)
    cachedMedHistory.set(patient.id, p.medicationHistory)
    reset({
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      address: p.address,
      bloodGroup: p.bloodGroup,
      dateOfBirth: p.dateOfBirth,
    })
    setDialogOpen(true)
  }

  async function onSave(data: PatientFormData) {
    try {
      if (editingPatient) {
        await updateMutation.mutateAsync({ id: editingPatient.id, data: data as any })
      } else {
        await createMutation.mutateAsync(data as any)
      }
      setDialogOpen(false)
      setEditingPatient(null)
    } catch {
      toast.error("Failed to save patient")
    }
  }

  async function deletePatient(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Patient deleted")
      if (expandedId === id) setExpandedId(null)
    } catch {
      toast.error("Failed to delete patient")
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function addAllergy(patient: Patient) {
    if (!newAllergy.trim()) return
    const existing = cachedAllergies.get(patient.id) ?? []
    const updated = [...existing, newAllergy.trim()]
    cachedAllergies.set(patient.id, updated)
    updateMutation.mutate({ id: patient.id, data: { allergies: updated } as any })
    setNewAllergy("")
  }

  function removeAllergy(patientId: string, index: number) {
    const existing = cachedAllergies.get(patientId) ?? []
    const updated = existing.filter((_, i) => i !== index)
    cachedAllergies.set(patientId, updated)
    updateMutation.mutate({ id: patientId, data: { allergies: updated } as any })
  }

  if (isLoading) {
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
            <div className="overflow-x-auto">
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
                {paginatedPatients.map((patient) => {
                  const p = getPatientWithExtras(patient)
                  return (
                    <Fragment key={p.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => toggleExpand(p.id)}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleExpand(p.id)
                            }}
                          >
                            {expandedId === p.id ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell>{getAgeDisplay(p)}</TableCell>
                        <TableCell>{p.gender || "-"}</TableCell>
                        <TableCell>{p.phone || "-"}</TableCell>
                        <TableCell>
                          {p.bloodGroup ? (
                            <Badge variant="outline">{p.bloodGroup}</Badge>
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
                                openEdit(p)
                              }}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePatient(p.id, p.name)
                              }}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/prescription?patient_id=${p.id}`)
                              }}
                              aria-label={`Create prescription for ${p.name}`}
                            >
                              <FileText className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedId === p.id && (
                        <TableRow key={`${p.id}-detail`}>
                          <TableCell colSpan={7} className="bg-muted/30 p-4">
                            <div className="grid gap-6 sm:grid-cols-2">
                              <div>
                                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  Contact Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-muted-foreground">Email:</span> {p.email || "-"}</p>
                                  <p><span className="text-muted-foreground">Phone:</span> {p.phone || "-"}</p>
                                  <p><span className="text-muted-foreground">Address:</span> {p.address || "-"}</p>
                                  <p><span className="text-muted-foreground">DOB:</span> {p.dateOfBirth || "-"}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  Allergies
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {p.allergies.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">No allergies recorded</span>
                                  ) : (
                                    p.allergies.map((a, i) => (
                                      <Badge key={i} variant="secondary" className="gap-1">
                                        {a}
                                        <button
                                          onClick={() => removeAllergy(p.id, i)}
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
                                        addAllergy(p)
                                      }
                                    }}
                                  />
                                  <Button
                                    size="xs"
                                    onClick={() => addAllergy(p)}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>

                              <div className="sm:col-span-2">
                                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                  Medication History
                                </h4>
                                {p.medicationHistory.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No medication history available
                                  </p>
                                ) : (
                                  <ul className="list-inside list-disc space-y-1 text-sm">
                                    {p.medicationHistory.map((med, i) => (
                                      <li key={i}>{med}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add Patient"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSave)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" max={150} {...register("age")} />
                {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={editingPatient?.gender ?? ""}
                  onValueChange={(v) => setValue("gender", (v === "" ? null : v) as "Male" | "Female" | "Other" | null)}
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
                  onValueChange={(v) => setValue("bloodGroup", (v === "" ? null : v) as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null)}
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
