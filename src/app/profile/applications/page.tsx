"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Calendar, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

interface Application {
  id: string
  car: {
    id: string
    brand: string
    model: string
    year: number
    media: Array<{
      url: string
      isPrimary: boolean
    }>
  }
  dealer: {
    name: string
  }
  carPrice: number
  downPayment: number
  loanTerm: number
  monthlyPayment: number
  creditScore: number
  status: "NEW" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  createdAt: string
}

const statusLabels = {
  NEW: "Новая",
  IN_PROGRESS: "В обработке",
  COMPLETED: "Завершена",
  CANCELLED: "Отменена",
}

const statusColors = {
  NEW: "bg-blue-100 text-blue-700 border-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-300",
  COMPLETED: "bg-green-100 text-green-700 border-green-300",
  CANCELLED: "bg-red-100 text-red-700 border-red-300",
}

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch("/api/applications")
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchApplications()
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background pt-14 pb-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-6 pb-20">
      <div className="container mx-auto px-4 max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Мои заявки</h1>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">У вас пока нет заявок</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Car Image */}
                    {app.car.media[0] && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={app.car.media[0].url}
                          alt={`${app.car.brand} ${app.car.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg">
                          {app.car.brand} {app.car.model} {app.car.year}
                        </h3>
                        <Badge variant="outline" className={statusColors[app.status]}>
                          {statusLabels[app.status]}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{app.dealer.name}</p>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{app.loanTerm} мес.</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Скоринг: {app.creditScore}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Ежемесячный платеж</span>
                        <span className="font-bold text-primary">{formatPrice(app.monthlyPayment)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(app.createdAt).toLocaleDateString("ru-RU")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
