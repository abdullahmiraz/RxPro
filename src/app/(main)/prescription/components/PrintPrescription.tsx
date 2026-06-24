"use client"

import { useCallback } from "react"
import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PrescriptionFormData } from "../types"

interface PrintPrescriptionProps {
  data: PrescriptionFormData
}

export default function PrintPrescription({ data }: PrintPrescriptionProps) {
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  return (
    <div>
      <div className="print-hide mb-4 flex justify-end">
        <Button
          variant="outline"
          onClick={handlePrint}
          aria-label="Print prescription"
        >
          <Printer className="size-4" />
          Print
        </Button>
      </div>

      <div className="print-container space-y-3 rounded-lg border p-4 text-xs">
        {/* Header */}
        <div className="border-b pb-2 text-center">
          <h2 className="text-sm font-bold">{data.headerData.clinicName}</h2>
          <p>{data.headerData.doctorName}</p>
          <p>{data.headerData.address}</p>
          <p className="text-muted-foreground">
            License: {data.headerData.licenseNumber}
          </p>
        </div>

        {/* Patient ID */}
        <div className="border-b pb-2">
          <span className="font-medium">Patient ID: </span>
          {data.patientId}
        </div>

        {/* Complaints */}
        {data.complaints.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Complaints</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-2">Complaint</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {data.complaints.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-2">{item.complaint}</td>
                    <td>{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Comorbidity */}
        {data.comorbidity.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Comorbidity</h3>
            <ul className="list-inside list-disc">
              {data.comorbidity.map((item) => (
                <li key={item.id}>{item.condition}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Examination */}
        {data.examination.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Examination</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-2">Finding</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {data.examination.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-2">{item.finding}</td>
                    <td>{item.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* On Examination */}
        {data.onExamination.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">On Examination</h3>
            {data.onExamination.map((item) => (
              <p key={item.id}>
                <span className="font-medium">{item.type}: </span>
                {item.finding}
              </p>
            ))}
          </div>
        )}

        {/* Diagnosis */}
        {data.diagnosis.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Diagnosis</h3>
            <ol className="list-inside list-decimal">
              {data.diagnosis.map((item) => (
                <li key={item.id}>{item.diagnosis}</li>
              ))}
            </ol>
          </div>
        )}

        {/* Medications */}
        {data.medications.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Medications</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-1">Drug</th>
                  <th className="pr-1">Dosage</th>
                  <th className="pr-1">Route</th>
                  <th className="pr-1">Frequency</th>
                  <th className="pr-1">Duration</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {data.medications.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-1">{item.drugName}</td>
                    <td className="pr-1">{item.dosage}</td>
                    <td className="pr-1">{item.routeType}</td>
                    <td className="pr-1">{item.frequency}</td>
                    <td className="pr-1">{item.duration}</td>
                    <td>{item.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Investigation */}
        {data.investigation.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Investigation</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-2">Test</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.investigation.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-2">{item.testName}</td>
                    <td>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* On Investigation */}
        {data.onInvestigation.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">On Investigation</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pr-2">Test</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.onInvestigation.map((item) => (
                  <tr key={item.id}>
                    <td className="pr-2">{item.testName}</td>
                    <td>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Advice */}
        {data.advice.length > 0 && (
          <div className="border-b pb-2">
            <h3 className="mb-1 text-xs font-semibold">Advice</h3>
            <ul className="list-inside list-disc">
              {data.advice.map((item) => (
                <li key={item.id}>{item.advice}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Follow Up */}
        <div className="pres-footer">
          <h3 className="mb-1 text-xs font-semibold">Follow Up</h3>
          {data.followUp.date && (
            <p>
              <span className="font-medium">Date: </span>
              {data.followUp.date}
            </p>
          )}
          {data.followUp.notes && (
            <p>
              <span className="font-medium">Notes: </span>
              {data.followUp.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
