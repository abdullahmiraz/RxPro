"use client"

import { useEffect } from "react"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import PrintPrescription from "../../components/PrintPrescription"
import type { PrescriptionFormData } from "../../types"

export function PrintView({ data }: { data: PrescriptionFormData }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <div className="print-hide mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Prescription Preview</h1>
        <Button
          variant="default"
          onClick={() => window.print()}
          aria-label="Print or save as PDF"
        >
          <Printer className="mr-2 size-4" />
          Print / Save as PDF
        </Button>
      </div>
      <PrintPrescription data={data} />
    </div>
  )
}
