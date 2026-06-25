"use client"

import { useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useCookies } from "next-client-cookies"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useDoctorInfo, useUpsertDoctorInfo } from "@/hooks/useDoctorInfo"
import PageHeader from "@/components/shared/page-header/PageHeader"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const doctorSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  qualifications: yup.string().required("Qualifications are required"),
  licenseNumber: yup.string().required("License number is required"),
  clinicName: yup.string().required("Clinic name is required"),
  address: yup.string().required("Address is required"),
  prescriptionHeader: yup.string(),
  prescriptionFooter: yup.string(),
})

interface DoctorFormData {
  name: string
  email: string
  phone: string
  qualifications: string
  licenseNumber: string
  clinicName: string
  address: string
  prescriptionHeader?: string
  prescriptionFooter?: string
}

const defaultValues: DoctorFormData = {
  name: "",
  email: "",
  phone: "",
  qualifications: "",
  licenseNumber: "",
  clinicName: "",
  address: "",
  prescriptionHeader: "",
  prescriptionFooter: "",
}

export default function DoctorInfoPage() {
  const cookies = useCookies()
  const doctorId = cookies.get("doctor_id")
  const { data: doctorInfo, isLoading } = useDoctorInfo(doctorId ?? undefined)
  const upsertMutation = useUpsertDoctorInfo()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormData>({
    resolver: yupResolver(doctorSchema) as any,
    defaultValues,
  })

  useEffect(() => {
    if (doctorInfo) {
      reset({
        name: (doctorInfo.name as string) ?? "",
        email: (doctorInfo.email as string) ?? "",
        phone: (doctorInfo.phone as string) ?? "",
        qualifications: (doctorInfo.qualifications as string) ?? "",
        licenseNumber: (doctorInfo.license_number as string) ?? (doctorInfo.licenseNumber as string) ?? "",
        clinicName: (doctorInfo.clinic_name as string) ?? (doctorInfo.clinicName as string) ?? "",
        address: (doctorInfo.address as string) ?? "",
        prescriptionHeader: (doctorInfo.header_template as string) ?? (doctorInfo.prescriptionHeader as string) ?? "",
        prescriptionFooter: (doctorInfo.footer_template as string) ?? (doctorInfo.prescriptionFooter as string) ?? "",
      })
    }
  }, [doctorInfo, reset])

  const onSubmit = useCallback(
    async (data: DoctorFormData) => {
      try {
        const payload: Record<string, unknown> = {
          doctor_id: doctorId,
          clinic_name: data.clinicName,
          address: data.address,
          phone: data.phone,
          email: data.email,
          license_number: data.licenseNumber,
          qualifications: data.qualifications,
          header_template: data.prescriptionHeader ?? null,
          footer_template: data.prescriptionFooter ?? null,
        }
        if (doctorInfo?.id) {
          payload.id = doctorInfo.id as string
        }
        await upsertMutation.mutateAsync(payload as any)
        toast.success("Doctor info saved")
      } catch {
        toast.error("Failed to save doctor info")
      }
    },
    [upsertMutation, doctorId, doctorInfo]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Doctor Information" description="Manage your professional profile" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your professional details and credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input id="qualifications" {...register("qualifications")} />
                {errors.qualifications && <p className="text-xs text-destructive">{errors.qualifications.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input id="licenseNumber" {...register("licenseNumber")} />
                {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Information</CardTitle>
            <CardDescription>Your clinic or practice details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Clinic Name</Label>
                <Input id="clinicName" {...register("clinicName")} />
                {errors.clinicName && <p className="text-xs text-destructive">{errors.clinicName.message}</p>}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={3} {...register("address")} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Header Template</CardTitle>
            <CardDescription>Text shown at the top of every prescription</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={3} {...register("prescriptionHeader")} placeholder="e.g. Dr. John Smith, MD" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Footer Template</CardTitle>
            <CardDescription>Text shown at the bottom of every prescription</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea rows={3} {...register("prescriptionFooter")} placeholder="e.g. Follow-up in 2 weeks" />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || upsertMutation.isPending}>
            {(isSubmitting || upsertMutation.isPending) ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {(isSubmitting || upsertMutation.isPending) ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  )
}
