import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/admin-login")
  }

  const [applications, sales, dealers, cars] = await Promise.all([
    prisma.application.findMany({
      include: {
        dealer: true,
      },
    }),
    prisma.sale.findMany({
      include: {
        dealer: true,
        car: true,
      },
    }),
    prisma.dealer.findMany(),
    prisma.car.findMany(),
  ])

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const thisMonthApplications = applications.filter((a) => a.createdAt >= thisMonth)
  const lastMonthApplications = applications.filter(
    (a) => a.createdAt >= lastMonth && a.createdAt <= lastMonthEnd
  )

  const thisMonthSales = sales.filter((s) => s.saleDate >= thisMonth)
  const lastMonthSales = sales.filter(
    (s) => s.saleDate >= lastMonth && s.saleDate <= lastMonthEnd
  )

  const thisMonthRevenue = thisMonthSales.reduce(
    (sum, sale) => sum + sale.salePrice,
    0
  )
  const lastMonthRevenue = lastMonthSales.reduce(
    (sum, sale) => sum + sale.salePrice,
    0
  )

  const applicationGrowth = lastMonthApplications.length > 0
    ? (((thisMonthApplications.length - lastMonthApplications.length) /
        lastMonthApplications.length) *
        100).toFixed(1)
    : "0"

  const salesGrowth = lastMonthSales.length > 0
    ? (((thisMonthSales.length - lastMonthSales.length) / lastMonthSales.length) *
        100).toFixed(1)
    : "0"

  const revenueGrowth = lastMonthRevenue > 0
    ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : "0"

  const dealerPerformance = dealers.map((dealer) => {
    const dealerApplications = applications.filter((a) => a.dealerId === dealer.id)
    const dealerSales = sales.filter((s) => s.dealerId === dealer.id)
    const dealerRevenue = dealerSales.reduce((sum, s) => sum + s.salePrice, 0)
    const conversionRate =
      dealerApplications.length > 0
        ? ((dealerSales.length / dealerApplications.length) * 100).toFixed(1)
        : "0"

    return {
      dealer,
      applications: dealerApplications.length,
      sales: dealerSales.length,
      revenue: dealerRevenue,
      conversionRate,
    }
  })

  dealerPerformance.sort((a, b) => b.revenue - a.revenue)

  const topCars = cars.map((car) => {
    const carApplications = applications.filter((a) => a.carId === car.id)
    const carSales = sales.filter((s) => s.carId === car.id)

    return {
      car,
      applications: carApplications.length,
      sales: carSales.length,
    }
  })

  topCars.sort((a, b) => b.sales - a.sales)

  const conversionRate =
    applications.length > 0
      ? ((sales.length / applications.length) * 100).toFixed(1)
      : "0"

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Аналитика платформы</h1>
        <p className="text-muted-foreground">
          Детальная аналитика и показатели эффективности
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Заявки этот месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">
                {thisMonthApplications.length}
              </p>
              <div
                className={`flex items-center text-sm ${
                  parseFloat(applicationGrowth) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {parseFloat(applicationGrowth) >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {applicationGrowth}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Прошлый месяц: {lastMonthApplications.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Продажи этот месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">{thisMonthSales.length}</p>
              <div
                className={`flex items-center text-sm ${
                  parseFloat(salesGrowth) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {parseFloat(salesGrowth) >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {salesGrowth}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Прошлый месяц: {lastMonthSales.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Выручка этот месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">
                {formatPrice(thisMonthRevenue)}
              </p>
              <div
                className={`flex items-center text-sm ${
                  parseFloat(revenueGrowth) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {parseFloat(revenueGrowth) >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {revenueGrowth}%
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Прошлый месяц: {formatPrice(lastMonthRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Общая конверсия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{conversionRate}%</div>
            <p className="text-sm text-muted-foreground mt-1">
              {sales.length} продаж из {applications.length} заявок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Средний чек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {sales.length > 0
                ? formatPrice(
                    Math.round(
                      sales.reduce((sum, s) => sum + s.salePrice, 0) /
                        sales.length
                    )
                  )
                : formatPrice(0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              На основе {sales.length} продаж
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Производительность дилеров</CardTitle>
        </CardHeader>
        <CardContent>
          {dealerPerformance.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет данных по дилерам
            </p>
          ) : (
            <div className="space-y-4">
              {dealerPerformance.slice(0, 10).map((item) => (
                <div
                  key={item.dealer.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.dealer.name}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Заявки: {item.applications}</span>
                      <span>Продажи: {item.sales}</span>
                      <span>Конверсия: {item.conversionRate}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatPrice(item.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">Выручка</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Топ автомобилей по продажам</CardTitle>
        </CardHeader>
        <CardContent>
          {topCars.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Нет данных по автомобилям
            </p>
          ) : (
            <div className="space-y-4">
              {topCars.slice(0, 10).map((item) => (
                <div
                  key={item.car.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {item.car.brand} {item.car.model} {item.car.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.car.engine} • {item.car.power} л.с.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{item.sales}</p>
                    <p className="text-xs text-muted-foreground">
                      продаж ({item.applications} заявок)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
