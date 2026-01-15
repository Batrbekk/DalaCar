import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import {
  Building2,
  Car,
  Users,
  FileText,
  TrendingUp,
  DollarSign,
} from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/admin-login")
  }

  const [dealers, cars, users, applications, sales, dealerCars] = await Promise.all([
    prisma.dealer.findMany(),
    prisma.car.findMany(),
    prisma.user.findMany(),
    prisma.application.findMany(),
    prisma.sale.findMany(),
    prisma.dealerCar.findMany(),
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

  const stats = [
    {
      title: "Дилеров",
      value: dealers.length,
      monthValue: dealers.filter((d) => d.createdAt >= thisMonth).length,
      icon: Building2,
      color: "text-blue-600",
    },
    {
      title: "Автомобилей в базе",
      value: cars.length,
      monthValue: dealerCars.filter((dc) => dc.inStock).length,
      suffix: " в продаже",
      icon: Car,
      color: "text-purple-600",
    },
    {
      title: "Пользователей",
      value: users.length,
      monthValue: users.filter((u) => u.createdAt >= thisMonth).length,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Заявок",
      value: applications.length,
      monthValue: thisMonthApplications.length,
      icon: FileText,
      color: "text-orange-600",
    },
    {
      title: "Продаж",
      value: sales.length,
      monthValue: thisMonthSales.length,
      icon: TrendingUp,
      color: "text-teal-600",
    },
    {
      title: "Выручка",
      value: formatPrice(totalRevenue),
      monthValue: formatPrice(thisMonthRevenue),
      icon: DollarSign,
      color: "text-primary",
    },
  ]

  const conversionRate =
    applications.length > 0
      ? ((sales.length / applications.length) * 100).toFixed(1)
      : "0"

  const usersByRole = {
    clients: users.filter((u) => u.role === "CLIENT").length,
    managers: users.filter((u) => u.role === "MANAGER").length,
    dealerAdmins: users.filter((u) => u.role === "DEALER_ADMIN").length,
    superAdmins: users.filter((u) => u.role === "SUPER_ADMIN").length,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Обзор платформы</h1>
        <p className="text-muted-foreground">
          Общая статистика и ключевые показатели DalaCar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
          <CardTitle>Распределение пользователей по ролям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{usersByRole.clients}</p>
              <p className="text-sm text-muted-foreground mt-1">Клиенты</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{usersByRole.managers}</p>
              <p className="text-sm text-muted-foreground mt-1">Менеджеры</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{usersByRole.dealerAdmins}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Админы дилеров
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold">{usersByRole.superAdmins}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Супер-админы
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
