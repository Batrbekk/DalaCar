import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DealerForm } from "@/components/admin/DealerForm"
import { DealerActions } from "@/components/admin/DealerActions"
import {
  Building2,
  Users,
  Car,
  FileText,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"

export default async function AdminDealersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/admin-login")
  }

  const dealers = await prisma.dealer.findMany({
    include: {
      _count: {
        select: {
          users: true,
          cars: true,
          applications: true,
          sales: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Управление дилерами</h1>
          <p className="text-muted-foreground">
            Создание и управление дилерскими центрами
          </p>
        </div>
        <DealerForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Всего дилеров</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dealers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Активные</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {dealers.filter((d) => d.isActive).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Неактивные</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {dealers.filter((d) => !d.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {dealers.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Нет дилеров</p>
          <DealerForm />
        </div>
      ) : (
        <div className="grid gap-4">
          {dealers.map((dealer) => (
            <Card key={dealer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>{dealer.name}</CardTitle>
                      {dealer.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {dealer.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={dealer.isActive ? "default" : "destructive"}>
                    {dealer.isActive ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{dealer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{dealer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{dealer.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Пользователи
                      </p>
                      <p className="font-semibold">{dealer._count.users}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Автомобили
                      </p>
                      <p className="font-semibold">{dealer._count.cars}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Заявки</p>
                      <p className="font-semibold">
                        {dealer._count.applications}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Продажи</p>
                      <p className="font-semibold">{dealer._count.sales}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Создан: {new Date(dealer.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                  <DealerActions
                    dealerId={dealer.id}
                    isActive={dealer.isActive}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
