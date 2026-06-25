"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useCookies } from "next-client-cookies"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2, Calendar, FileText } from "lucide-react"

import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "@/hooks/useAppointments"
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
  patientName: yup.string().required("Patient name is required"),
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

interface Appointment extends AppointmentFormData {
  id: string
}

const defaultForm: AppointmentFormData = {
  patientName: "",
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
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment()
  const deleteMutation = useDeleteAppointment()

  const [dateFilter, setDateFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)

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
        ? appointmentList.filter((a) => a.date === dateFilter)
        : appointmentList,
    [appointmentList, dateFilter]
  )

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedAppointments = filtered.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [dateFilter])

  function openAdd() {
    setEditingAppt(null)
    reset(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(appt: Appointment) {
    setEditingAppt(appt)
    reset({
      patientName: appt.patientName,
      date: appt.date,
      time: appt.time,
      reason: appt.reason,
      notes: appt.notes,
      status: appt.status,
    })
    setDialogOpen(true)
  }

  async function onSave(data: AppointmentFormData) {
    try {
      if (editingAppt) {
        await updateMutation.mutateAsync({ id: editingAppt.id, data: data as any })
      } else {
        await createMutation.mutateAsync(data as any)
      }
      setDialogOpen(false)
      setEditingAppt(null)
    } catch {
      // mutation error
    }
  }

  function deleteAppointment(id: string) {
    deleteMutation.mutate(id)
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
                    <TableCell className="font-medium">{appt.patientName}</TableCell>
                    <TableCell>{appt.date}</TableCell>
                    <TableCell>{appt.time}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[appt.status]}>
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
                          aria-label={`Create prescription for ${appt.patientName}`}
                          onClick={() => router.push(`/prescription?appointment_id=${appt.id}&patient_id=${(appt as any).patient_id ?? ""}`)}
                        >
                          <FileText className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => deleteAppointment(appt.id)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input id="patientName" {...register("patientName")} />
                {errors.patientName && (
                  <p className="text-xs text-destructive">{errors.patientName.message}</p>
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
