"use client"

import { useState, useCallback } from "react"
import { FileText, ClipboardList } from "lucide-react"

import PageHeader from "@/components/shared/page-header/PageHeader"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import PrescriptionForm from "./components/PrescriptionForm"
import PrescriptionHistory from "./components/PrescriptionHistory"
import PrintPrescription from "./components/PrintPrescription"
import type { PrescriptionFormData } from "./types"

export default function PrescriptionPage() {
  const [printData, setPrintData] = useState<PrescriptionFormData | null>(
    null
  )

  const handlePrint = useCallback((data: PrescriptionFormData) => {
    setPrintData(data)
  }, [])

  const handleBack = useCallback(() => {
    setPrintData(null)
  }, [])

  if (printData) {
    return (
      <div>
        <PageHeader title="Print Prescription">
          <button
            onClick={handleBack}
            className="text-sm text-muted-foreground underline hover:text-foreground"
            aria-label="Back to prescription form"
          >
            Back to Form
          </button>
        </PageHeader>
        <PrintPrescription data={printData} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Prescription"
        description="Create and manage prescriptions"
      />

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new" aria-label="New prescription tab">
            <FileText className="size-4" />
            New Prescription
          </TabsTrigger>
          <TabsTrigger value="history" aria-label="Prescription history tab">
            <ClipboardList className="size-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <PrescriptionForm onPrint={handlePrint} />
        </TabsContent>

        <TabsContent value="history">
          <PrescriptionHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
