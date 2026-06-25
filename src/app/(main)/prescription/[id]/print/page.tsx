import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { fetchPrescription } from "@/lib/dal"
import { dalRecordToPrescriptionFormData } from "@/lib/prescription-transform"
import { PrintView } from "./print-view"

export default async function PrescriptionPrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const doctorId = cookieStore.get("doctor_id")?.value
  const token = cookieStore.get("rx-token")?.value

  if (!doctorId || !token) {
    redirect("/login")
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.doctor_id !== doctorId) {
    redirect("/login")
  }

  const record = fetchPrescription(id, doctorId)
  if (!record) {
    notFound()
  }

  const formData = dalRecordToPrescriptionFormData(record as Record<string, unknown>)

  return <PrintView data={formData} />
}
