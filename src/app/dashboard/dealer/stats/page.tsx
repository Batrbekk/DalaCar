import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import {
  Users,
  Car,
  CheckCircle,
  TrendingUp,
  Calendar,
  DollarSign,
} from "lucide-react"

export default async function DealerStatsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/admin-login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { dealer: true },
  })

  if (!user?.dealerId && session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Вы не привязаны ни к одному дилеру
        </p>
      </div>
    )
  }

  if (!user && session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Ошибка загрузки данных пользователя
        </p>
      </div>
    )
  }

  const dealerId = user?.dealerId || ""

  // Для менеджера показываем заявки без менеджера + его назначенные заявки
  const isManager = session.user.role === "MANAGER"
  const applicationWhere = session.user.role === "SUPER_ADMIN"
    ? {}
    : isManager
    ? {
        dealerId,
        OR: [
          { managerId: null }, // Заявки без менеджера
          { managerId: session.user.id }, // Его назначенные заявки
        ],
      }
    : { dealerId }

  const salesWhere = session.user.role === "SUPER_ADMIN"
    ? {}
    : isManager
    ? { dealerId, managerId: session.user.id }
    : { dealerId }

  const [applications, dealerCars, sales] = await Promise.all([
    prisma.application.findMany({
      where: applicationWhere,
    }),
    // Менеджер не видит автомобили
    isManager
      ? Promise.resolve([])
      : prisma.dealerCar.findMany({
          where: session.user.role === "SUPER_ADMIN" ? {} : { dealerId },
        }),
    prisma.sale.findMany({
      where: salesWhere,
      include: {
        car: true,
        manager: true,
      },
    }),
  ])

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const thisMonthApplications = applications.filter(
    (a) => a.createdAt >= thisMonth
  )
  const thisMonthSales = sales.filter((s) => s.saleDate >= thisMonth)

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePrice, 0)
  const thisMonthRevenue = thisMonthSales.reduce(
    (sum, sale) => sum + sale.salePrice,
    0
  )

  const baseStats = [
    {
      title: "Всего заявок",
      value: applications.length,
      monthValue: thisMonthApplications.length,
      icon: Users,
      color: "text-blue-600",
      suffix: undefined as string | undefined,
    },
    {
      title: "Завершенных продаж",
      value: sales.length,
      monthValue: thisMonthSales.length,
      icon: CheckCircle,
      color: "text-green-600",
      suffix: undefined as string | undefined,
    },
    {
      title: "Общая выручка",
      value: formatPrice(totalRevenue),
      monthValue: formatPrice(thisMonthRevenue),
      icon: DollarSign,
      color: "text-primary",
      suffix: undefined as string | undefined,
    },
  ]

  // Добавляем карточку автомобилей только для админов
  const stats = isManager
    ? baseStats
    : [
        baseStats[0]!,
        {
          title: "Автомобили в продаже",
          value: dealerCars.length,
          monthValue: dealerCars.filter((dc) => dc.inStock).length,
          suffix: " в наличии",
          icon: Car,
          color: "text-purple-600",
        },
        ...baseStats.slice(1),
      ]

  const conversionRate =
    applications.length > 0
      ? ((sales.length / applications.length) * 100).toFixed(1)
      : "0"

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isManager ? "Моя статистика" : "Статистика"}
        </h1>
        <p className="text-muted-foreground">
          {isManager ? "Ваши показатели и продажи" : "Аналитика и показатели продаж"}
        </p>
      </div>

      {/* Код менеджера */}
      {isManager && (
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle>Ваш код менеджера</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold font-mono text-primary">
                {session.user.id.slice(-6).toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Используйте этот код для</p>
                <p>отслеживания ваших продаж</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Этот месяц:{" "}
                {typeof stat.monthValue === "number"
                  ? stat.monthValue.toLocaleString()
                  : stat.monthValue}
                {stat.suffix || ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Конверсия заявок в продажи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{conversionRate}%</span>
              <span className="text-sm text-muted-foreground">
                ({sales.length} из {applications.length})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Средний чек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {sales.length > 0
                ? formatPrice(Math.round(totalRevenue / sales.length))
                : formatPrice(0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              На основе {sales.length} продаж
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Последние продажи</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет завершенных продаж
            </div>
          ) : (
            <div className="space-y-4">
              {sales.slice(0, 10).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {sale.car.brand} {sale.car.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.manager?.name} •{" "}
                      {new Date(sale.saleDate).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <p className="font-bold text-primary">
                    {formatPrice(sale.salePrice)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
