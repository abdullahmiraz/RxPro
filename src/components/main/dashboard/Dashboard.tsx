"use client"

import { useState, useEffect } from "react"
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
import { Users, Calendar, Pill, TrendingUp } from "lucide-react"

interface StatCard {
  title: string
  value: string
  icon: typeof Users
  bg: string
}

const statCards: StatCard[] = [
  { title: "Patients Visited", value: "128", icon: Users, bg: "bg-blue-50" },
  { title: "Future Appointments", value: "24", icon: Calendar, bg: "bg-emerald-50" },
  { title: "Medicines Prescribed", value: "356", icon: Pill, bg: "bg-amber-50" },
  { title: "Last 7 Days", value: "+12%", icon: TrendingUp, bg: "bg-purple-50" },
]

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back, Doctor." />

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
            ) : recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{row.date}</TableCell>
                      <TableCell>{row.activity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
