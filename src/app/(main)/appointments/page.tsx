"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useCookies } from "next-client-cookies"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Calendar, FileText } from "lucide-react"

import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/useAppointments"
import { usePatients } from "@/hooks/usePatients"
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

const appointmentSchema = yup.object({
  date: yup.string().required("Date is required"),
  time: yup.string().required("Time is required"),
  reason: yup.string().required("Reason is required"),
  notes: yup.string(),
  status: yup
    .string()
    .oneOf(["Scheduled", "Completed", "Cancelled"])
    .required(),
})

type AppointmentFormData = yup.InferType<typeof appointmentSchema>

interface Appointment {
  id: string
  patient_name?: string
  patient_id?: string
  appointment_date?: string
  appointment_time?: string
  status: string
  reason: string
  notes?: string
}

const defaultForm: AppointmentFormData = {
  date: "",
  time: "",
  reason: "",
  notes: "",
  status: "Scheduled",
}

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  Scheduled: "default",
  Completed: "secondary",
  Cancelled: "outline",
}

export default function AppointmentsPage() {
  const router = useRouter()
  const cookies = useCookies()
  const doctorId = cookies.get("doctor_id")
  const { data: appointments, isLoading } = useAppointments(doctorId ?? undefined)
  const { data: patients } = usePatients()
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment()
  const deleteMutation = useDeleteAppointment()

  const [dateFilter, setDateFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Record<string, unknown> | null>(null)
  const [patientSearch, setPatientSearch] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: yupResolver(appointmentSchema) as any,
    defaultValues: defaultForm,
  })

  const appointmentList = (appointments ?? []) as unknown as Appointment[]

  const filtered = useMemo(
    () =>
      dateFilter
        ? appointmentList.filter((a) => a.appointment_date === dateFilter)
        : appointmentList,
    [appointmentList, dateFilter]
  )

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedAppointments = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [dateFilter])

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim() || !patients) return []
    return (patients as Record<string, unknown>[]).filter((p) =>
      String(p.name ?? "").toLowerCase().includes(patientSearch.toLowerCase())
    )
  }, [patientSearch, patients])

  function openAdd() {
    setEditingAppt(null)
    setSelectedPatient(null)
    setPatientSearch("")
    reset(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(appt: Appointment) {
    setEditingAppt(appt)
    setSelectedPatient(appt.patient_id ? ({ id: appt.patient_id, name: appt.patient_name } as Record<string, unknown>) : null)
    setPatientSearch(appt.patient_name ?? "")
    reset({
      date: appt.appointment_date ?? "",
      time: appt.appointment_time ?? "",
      reason: appt.reason ?? "",
      notes: appt.notes ?? "",
      status: (appt.status ?? "Scheduled") as "Scheduled" | "Completed" | "Cancelled",
    })
    setDialogOpen(true)
  }

  async function onSave(data: AppointmentFormData) {
    try {
      const patientId = editingAppt?.patient_id ?? (selectedPatient?.id as string | undefined)
      if (!patientId) {
        toast.error("Please select a patient")
        return
      }
      const payload = {
        patient_id: patientId,
        appointment_date: data.date,
        appointment_time: data.time,
        reason: data.reason,
        notes: data.notes || "",
        status: data.status.toLowerCase(),
      }
      if (editingAppt) {
        await updateMutation.mutateAsync({ id: editingAppt.id, data: payload as any })
      } else {
        await createMutation.mutateAsync(payload as any)
      }
      setDialogOpen(false)
      setEditingAppt(null)
      setSelectedPatient(null)
      setPatientSearch("")
    } catch {
      toast.error("Failed to save appointment")
    }
  }

  async function deleteAppointment(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Appointment deleted")
    } catch {
      toast.error("Failed to delete appointment")
    }
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
      <PageHeader title="Appointments" description="Schedule and manage patient appointments">
        <Button onClick={openAdd}>
          <Plus className="size-4" />
          Add Appointment
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-4">
          <div className="mb-4 flex items-center gap-3">
            <Calendar className="size-4 text-muted-foreground" />
            <Input
              type="date"
              className="w-fit"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <Button variant="ghost" size="xs" onClick={() => setDateFilter("")}>
                Clear
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <Calendar className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No appointments found. Add your first appointment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAppointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell className="font-medium">{appt.patient_name ?? "-"}</TableCell>
                    <TableCell>{appt.appointment_date ?? "-"}</TableCell>
                    <TableCell>{appt.appointment_time ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[appt.status] ?? "secondary"}>
                        {appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {appt.reason}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openEdit(appt)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Create prescription for ${appt.patient_name ?? "patient"}`}
                          onClick={() => router.push(`/prescription?appointment_id=${appt.id}&patient_id=${appt.patient_id ?? ""}`)}
                        >
                          <FileText className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => deleteAppointment(appt.id, appt.patient_name ?? "unknown")}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
            <DialogTitle>{editingAppt ? "Edit Appointment" : "Add Appointment"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSave)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="patientSearch">Patient *</Label>
                <Input
                  id="patientSearch"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value)
                    if (!e.target.value) {
                      setSelectedPatient(null)
                    }
                  }}
                  placeholder="Type patient name..."
                  aria-label="Search patient by name"
                />
                {filteredPatients.length > 0 && (
                  <div className="max-h-48 overflow-auto rounded-md border">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id as string}
                        type="button"
                        onClick={() => {
                          setSelectedPatient(p)
                          setPatientSearch(p.name as string)
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                        aria-label={`Select patient ${p.name as string}`}
                      >
                        <span className="font-medium">{p.name as string}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {p.phone as string}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedPatient && !filteredPatients.length && (
                  <p className="text-xs text-muted-foreground">Selected: {selectedPatient.name as string}</p>
                )}
                {!selectedPatient && !filteredPatients.length && patientSearch && (
                  <p className="text-xs text-destructive">No matching patients found</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" {...register("time")} />
                {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
              </div>

              {editingAppt && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingAppt.status}
                    onValueChange={(v) => setValue("status", v as "Scheduled" | "Completed" | "Cancelled")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea id="reason" rows={2} {...register("reason")} />
                {errors.reason && (
                  <p className="text-xs text-destructive">{errors.reason.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" rows={2} {...register("notes")} />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <DialogClose render={<Button variant="outline">Cancel</Button>} />
              <Button type="submit">{editingAppt ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
