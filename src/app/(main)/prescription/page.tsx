"use client"

import { useState } from "react"
import { Eye, FileText } from "lucide-react"

import PageHeader from "@/components/shared/page-header/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface Prescription {
  id: string
  patientName: string
  date: string
  medication: string
  dosage: string
  status: "Active" | "Completed"
}

const samplePrescriptions: Prescription[] = [
  {
    id: "1",
    patientName: "John Doe",
    date: "2026-06-20",
    medication: "Amoxicillin 500mg",
    dosage: "1 capsule three times daily",
    status: "Active",
  },
  {
    id: "2",
    patientName: "Jane Smith",
    date: "2026-06-18",
    medication: "Lisinopril 10mg",
    dosage: "1 tablet daily",
    status: "Active",
  },
  {
    id: "3",
    patientName: "Robert Johnson",
    date: "2026-06-15",
    medication: "Metformin 1000mg",
    dosage: "1 tablet twice daily with meals",
    status: "Completed",
  },
]

export default function PrescriptionPage() {
  const [selected, setSelected] = useState<Prescription | null>(null)

  return (
    <div>
      <PageHeader title="Prescription" description="Create and manage prescriptions" />

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <FileText className="size-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Prescription module coming soon</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The full prescription creation and management system is under development.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="mb-3 text-sm font-medium">Sample Prescriptions</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samplePrescriptions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.patientName}</TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell>{p.medication}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "Active" ? "default" : "secondary"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon-xs" onClick={() => setSelected(p)}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
            <DialogDescription>View prescription information</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Patient:</span>
                  <p className="font-medium">{selected.patientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{selected.date}</p>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Medication:</span>
                <p className="font-medium">{selected.medication}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dosage:</span>
                <p className="font-medium">{selected.dosage}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={selected.status === "Active" ? "default" : "secondary"}>
                  {selected.status}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Close</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
