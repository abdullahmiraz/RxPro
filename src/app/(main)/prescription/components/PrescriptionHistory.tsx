"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Eye, FileText, Loader2, Search, Printer, FileDown, Pencil, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCookies } from "next-client-cookies"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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

function renderJsonList(jsonStr: string): React.ReactNode {
  try {
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return <p className="text-muted-foreground text-sm">None</p>
    }
    return (
      <ul className="list-disc pl-4 space-y-1">
        {parsed.map((item: unknown, i: number) => {
          if (typeof item === "string") {
            return <li key={i} className="text-sm">{item}</li>
          }
          const obj = item as Record<string, string>
          const name = obj.drugName || obj.name || ""
          const dosage = obj.dosage || ""
          const instructions = obj.instructions || ""
          return (
            <li key={i} className="text-sm">
              {name}{dosage ? ` - ${dosage}` : ""}{instructions ? ` (${instructions})` : ""}
            </li>
          )
        })}
      </ul>
    )
  } catch {
    return <p className="text-sm">{jsonStr}</p>
  }
}

export default function PrescriptionHistory() {
  const cookies = useCookies()
  const router = useRouter()
  const doctorId = cookies.get("doctor_id")
  const { data, isLoading, error } = usePrescriptions(doctorId)
  const [selected, setSelected] = useState<PrescriptionRecord | null>(null)
  const [search, setSearch] = useState("")

  const records: PrescriptionRecord[] = Array.isArray(data)
    ? (data as unknown as PrescriptionRecord[])
    : []

  const filteredRecords = useMemo(
    () =>
      search
        ? records.filter((r) =>
            (r.patient_name ?? "")
              .toLowerCase()
              .includes(search.toLowerCase())
          )
        : records,
    [records, search]
  )

  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(filteredRecords.length / pageSize)
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => setPage(1), [search])

  const handleView = useCallback((record: PrescriptionRecord) => {
    setSelected(record)
  }, [])

  const handleClose = useCallback(() => {
    setSelected(null)
  }, [])

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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search prescriptions"
          />
        </div>
        <div className="overflow-x-auto">
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
            {paginatedRecords.map((record) => (
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
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleView(record)}
                      aria-label={`View prescription for ${record.patient_name ?? "unknown patient"}`}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Edit prescription"
                      onClick={() => router.push(`/prescription?edit_id=${record.id}`)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Clone prescription"
                      onClick={() => router.push(`/prescription?clone_id=${record.id}`)}
                    >
                      <Copy className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>

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
                  <div className="mt-0.5">
                    {renderJsonList(selected.complaints)}
                  </div>
                </div>
              )}
              {selected.diagnosis && (
                <div>
                  <span className="text-muted-foreground">
                    Diagnosis:
                  </span>
                  <div className="mt-0.5">
                    {renderJsonList(selected.diagnosis)}
                  </div>
                </div>
              )}
              {selected.medications && (
                <div>
                  <span className="text-muted-foreground">
                    Medications:
                  </span>
                  <div className="mt-0.5">
                    {renderJsonList(selected.medications)}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="print-hide">
            <Button
              variant="outline"
              onClick={() => window.open(`/prescription/${selected?.id}/print`, "_blank")}
              aria-label="Download prescription as PDF"
            >
              <FileDown className="size-4" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => window.print()}
              aria-label="Print prescription"
            >
              <Printer className="size-4" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
