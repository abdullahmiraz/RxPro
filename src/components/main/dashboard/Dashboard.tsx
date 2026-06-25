"use client"

import PageHeader from "@/components/shared/page-header/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Users, Calendar, Pill, TrendingUp, Stethoscope, ClipboardList, Sparkles } from "lucide-react"
import { useCookies } from "next-client-cookies"
import Link from "next/link"
import { usePatients } from "@/hooks/usePatients"
import { useAppointments } from "@/hooks/useAppointments"
import { usePrescriptions } from "@/hooks/usePrescriptions"
import { useDoctorInfo } from "@/hooks/useDoctorInfo"

const weeklyData = [8, 12, 6, 15, 10, 18, 9]
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const recentActivity = [
  { date: "2024-06-24", activity: "Prescribed Amoxicillin 500mg to John Doe" },
  { date: "2024-06-24", activity: "Follow-up appointment scheduled with Jane Smith" },
  { date: "2024-06-23", activity: "Updated patient records for Emily Johnson" },
  { date: "2024-06-23", activity: "Prescribed Metformin 850mg to Robert Brown" },
  { date: "2024-06-22", activity: "New patient registration: Michael Davis" },
]

const maxValue = Math.max(...weeklyData)

export default function Dashboard() {
  const cookies = useCookies()
  const doctorId = cookies.get("doctor_id") ?? ""

  const { data: patients, isLoading: patientsLoading } = usePatients()
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments(doctorId || undefined)
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePrescriptions(doctorId || undefined)
  const { data: doctorInfo, isLoading: doctorInfoLoading } = useDoctorInfo(doctorId || undefined)

  const loading = patientsLoading || appointmentsLoading || prescriptionsLoading || doctorInfoLoading

  const isSetupComplete = !!doctorInfo
  const doctorName = (doctorInfo as Record<string, unknown> | undefined)?.doctor_name as string || "Doctor"

  const patientsCount = (patients as Record<string, unknown>[])?.length ?? 0
  const futureAppointments = (appointments as Record<string, unknown>[])?.filter(a => (a as { status?: string }).status === "scheduled").length ?? 0
  const medicinesCount = (prescriptions as Record<string, unknown>[])?.length ?? 0

  const statCards = [
    { title: "Patients Visited", value: String(patientsCount), icon: Users, bg: "bg-blue-50" },
    { title: "Future Appointments", value: String(futureAppointments), icon: Calendar, bg: "bg-emerald-50" },
    { title: "Medicines Prescribed", value: String(medicinesCount), icon: Pill, bg: "bg-amber-50" },
    { title: "Last 7 Days", value: "+12%", icon: TrendingUp, bg: "bg-purple-50" },
  ]

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${doctorName}.`} />

      {!isSetupComplete && !loading && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="mt-1 size-6 text-blue-600" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">Getting Started</h3>
                <p className="mb-4 mt-1 text-sm text-blue-700">Set up your clinic profile and data to start creating prescriptions.</p>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                  <Link href="/doctor-info" className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100">
                    <Stethoscope className="size-4" />
                    Doctor Info
                  </Link>
                  <Link href="/patient-info" className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100">
                    <Users className="size-4" />
                    Add Patients
                  </Link>
                  <Link href="/favorite-setup" className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100">
                    <ClipboardList className="size-4" />
                    Setup Templates
                  </Link>
                  <Link href="/favorite-medicine" className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-100">
                    <Pill className="size-4" />
                    Favorite Meds
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full",
                      card.bg
                    )}
                  >
                    <Icon className="size-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <span className="text-3xl font-bold">
                    {loading ? (
                      <span
                        className="inline-block h-8 w-16 animate-pulse rounded bg-muted"
                        aria-label="Loading"
                      />
                    ) : (
                      card.value
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Patient Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-end justify-between gap-2"
              role="img"
              aria-label="Bar chart of weekly patient visits"
            >
              {weeklyData.map((value, i) => (
                <div key={days[i]} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">{value}</span>
                  <div
                    className="w-full rounded-md bg-blue-500 transition-all"
                    style={{ height: `${(value / maxValue) * 160}px` }}
                    aria-label={`${days[i]}: ${value} patients`}
                  />
                  <span className="text-xs text-muted-foreground">{days[i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3" role="status" aria-label="Loading activity">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                        No recent activity
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentActivity.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{row.date}</TableCell>
                        <TableCell>{row.activity}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
