import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/utils"
import { ApplicationStatusButton } from "@/components/dashboard/ApplicationStatusButton"
import { AssignManagerButton } from "@/components/dashboard/AssignManagerButton"

export default async function DealerDashboardPage() {
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

  // Для менеджера показываем заявки без менеджера + его назначенные заявки
  const isManager = session.user.role === "MANAGER"
  const applicationWhere = session.user.role === "SUPER_ADMIN"
    ? {}
    : isManager
    ? {
        dealerId: user.dealerId!,
        OR: [
          { managerId: null }, // Заявки без менеджера
          { managerId: session.user.id }, // Его назначенные заявки
        ],
      }
    : { dealerId: user.dealerId! }

  const applications = await prisma.application.findMany({
    where: applicationWhere,
    include: {
      car: true,
      dealer: true,
      manager: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === "NEW").length,
    inProgress: applications.filter((a) => a.status === "IN_PROGRESS").length,
    completed: applications.filter((a) => a.status === "COMPLETED").length,
    cancelled: applications.filter((a) => a.status === "CANCELLED").length,
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      NEW: "default",
      IN_PROGRESS: "secondary",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    }
    const labels: Record<string, string> = {
      NEW: "Новая",
      IN_PROGRESS: "В работе",
      COMPLETED: "Завершена",
      CANCELLED: "Отменена",
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const filterApplications = (status?: string) => {
    if (!status) return applications
    return applications.filter((a) => a.status === status)
  }

  const ApplicationCard = ({ app }: { app: typeof applications[0] }) => (
    <Card key={app.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {app.car.brand} {app.car.model}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(app.createdAt).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          {getStatusBadge(app.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Клиент:</span>
            <p className="font-medium">{app.name}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Телефон:</span>
            <p className="font-medium">{app.phone}</p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Город:</span>
            <p className="font-medium">{app.city}</p>
          </div>
          {app.iin && (
            <div className="col-span-2">
              <span className="text-muted-foreground">ИИН:</span>
              <p className="font-medium">{app.iin}</p>
            </div>
          )}
          {app.salary && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Зарплата:</span>
              <p className="font-medium">{formatPrice(app.salary)}</p>
            </div>
          )}
          {app.creditScore && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Кредитный скоринг:</span>
              <p className="font-medium text-primary">{app.creditScore} баллов</p>
            </div>
          )}
          <div className="col-span-2">
            <span className="text-muted-foreground">Менеджер:</span>
            {app.manager ? (
              <p className="font-medium">{app.manager.name}</p>
            ) : (
              <p className="font-medium text-orange-600">Не назначен</p>
            )}
          </div>
        </div>
        {app.message && (
          <div className="text-sm">
            <span className="text-muted-foreground">Сообщение:</span>
            <p className="mt-1">{app.message}</p>
          </div>
        )}

        {/* Информация о кредите */}
        {app.carPrice && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Стоимость:</span>
              <span className="font-medium">{formatPrice(app.carPrice)}</span>
            </div>
            {app.downPayment && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Первый взнос:</span>
                <span className="font-medium">{formatPrice(app.downPayment)}</span>
              </div>
            )}
            {app.loanTerm && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Срок:</span>
                <span className="font-medium">{app.loanTerm} мес.</span>
              </div>
            )}
            {app.monthlyPayment && (
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Ежемесячный платеж:</span>
                <span className="font-bold text-primary">{formatPrice(app.monthlyPayment)}</span>
              </div>
            )}
          </div>
        )}

        {/* Кнопка для менеджера */}
        {!app.managerId && isManager ? (
          <AssignManagerButton applicationId={app.id} />
        ) : (
          <ApplicationStatusButton
            applicationId={app.id}
            currentStatus={app.status}
          />
        )}
      </CardContent>
    </Card>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Заявки</h1>
        <p className="text-muted-foreground">
          Управление заявками от клиентов
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Всего</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Новые</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.new}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">В работе</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-secondary">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Завершено</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Отменено</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Все ({stats.total})</TabsTrigger>
          <TabsTrigger value="NEW">Новые ({stats.new})</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">В работе ({stats.inProgress})</TabsTrigger>
          <TabsTrigger value="COMPLETED">Завершено ({stats.completed})</TabsTrigger>
          <TabsTrigger value="CANCELLED">Отменено ({stats.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Нет заявок</p>
            </div>
          ) : (
            applications.map((app) => <ApplicationCard key={app.id} app={app} />)
          )}
        </TabsContent>

        <TabsContent value="NEW" className="space-y-4">
          {filterApplications("NEW").map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </TabsContent>

        <TabsContent value="IN_PROGRESS" className="space-y-4">
          {filterApplications("IN_PROGRESS").map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </TabsContent>

        <TabsContent value="COMPLETED" className="space-y-4">
          {filterApplications("COMPLETED").map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </TabsContent>

        <TabsContent value="CANCELLED" className="space-y-4">
          {filterApplications("CANCELLED").map((app) => (
            <ApplicationCard key={app.id} app={app} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
