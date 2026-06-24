"use client"

import { useState, useCallback } from "react"
import { Eye, FileText, Loader2 } from "lucide-react"
import { useCookies } from "next-client-cookies"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePrescriptions } from "@/hooks/usePrescriptions"

interface PrescriptionRecord {
  id: string
  patient_name?: string
  patient_id?: string
  created_at?: string
  status?: string
  medication?: string
  doctor_id?: string
  complaints?: string
  diagnosis?: string
  medications?: string
}

export default function PrescriptionHistory() {
  const cookies = useCookies()
  const doctorId = cookies.get("doctor_id")
  const { data, isLoading, error } = usePrescriptions(doctorId)
  const [selected, setSelected] = useState<PrescriptionRecord | null>(null)

  const handleView = useCallback((record: PrescriptionRecord) => {
    setSelected(record)
  }, [])

  const handleClose = useCallback(() => {
    setSelected(null)
  }, [])

  const records: PrescriptionRecord[] = Array.isArray(data)
    ? (data as unknown as PrescriptionRecord[])
    : []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-destructive">
            Failed to load prescriptions. Please try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <FileText className="size-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No prescriptions yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first prescription using the New Prescription tab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Patient Name</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {record.created_at
                    ? new Date(record.created_at).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="font-medium">
                  {record.patient_name ?? "-"}
                </TableCell>
                <TableCell>{record.patient_id ?? "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "Active" ? "default" : "secondary"
                    }
                  >
                    {record.status ?? "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleView(record)}
                    aria-label={`View prescription for ${record.patient_name ?? "unknown patient"}`}
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={!!selected}
        onOpenChange={(open: boolean) => !open && handleClose()}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>
              View full prescription information
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Patient:</span>
                  <p className="font-medium">
                    {selected.patient_name ?? "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Patient ID:</span>
                  <p className="font-medium">
                    {selected.patient_id ?? "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">
                    {selected.created_at
                      ? new Date(selected.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium">
                    <Badge
                      variant={
                        selected.status === "Active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selected.status ?? "N/A"}
                    </Badge>
                  </p>
                </div>
              </div>
              {selected.complaints && (
                <div>
                  <span className="text-muted-foreground">
                    Complaints:
                  </span>
                  <p className="mt-0.5 font-medium">
                    {selected.complaints}
                  </p>
                </div>
              )}
              {selected.diagnosis && (
                <div>
                  <span className="text-muted-foreground">
                    Diagnosis:
                  </span>
                  <p className="mt-0.5 font-medium">
                    {selected.diagnosis}
                  </p>
                </div>
              )}
              {selected.medications && (
                <div>
                  <span className="text-muted-foreground">
                    Medications:
                  </span>
                  <p className="mt-0.5 font-medium">
                    {selected.medications}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
