import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserForm } from "@/components/admin/UserForm"
import { UserActions } from "@/components/admin/UserActions"
import { Users, Phone, Building2 } from "lucide-react"

const roleLabels = {
  CLIENT: "Клиент",
  MANAGER: "Менеджер",
  DEALER_ADMIN: "Админ дилера",
  SUPER_ADMIN: "Супер-админ",
}

const roleColors = {
  CLIENT: "bg-gray-100 text-gray-800",
  MANAGER: "bg-blue-100 text-blue-800",
  DEALER_ADMIN: "bg-purple-100 text-purple-800",
  SUPER_ADMIN: "bg-red-100 text-red-800",
}

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/admin-login")
  }

  const [users, dealers] = await Promise.all([
    prisma.user.findMany({
      include: {
        dealer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.dealer.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
      },
    }),
  ])

  const usersByRole = {
    clients: users.filter((u) => u.role === "CLIENT").length,
    managers: users.filter((u) => u.role === "MANAGER").length,
    dealerAdmins: users.filter((u) => u.role === "DEALER_ADMIN").length,
    superAdmins: users.filter((u) => u.role === "SUPER_ADMIN").length,
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Управление пользователями
          </h1>
          <p className="text-muted-foreground">
            Создание и управление пользователями системы
          </p>
        </div>
        <UserForm dealers={dealers} />
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Клиенты</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{usersByRole.clients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Менеджеры</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {usersByRole.managers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Админы дилеров</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {usersByRole.dealerAdmins}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Супер-админы</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {usersByRole.superAdmins}
            </p>
          </CardContent>
        </Card>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Нет пользователей</p>
          <UserForm dealers={dealers} />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle>{user.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          className={roleColors[user.role]}
                          variant="secondary"
                        >
                          {roleLabels[user.role]}
                        </Badge>
                        {user.id === session.user.id && (
                          <Badge variant="outline">Вы</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  {user.dealer && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{user.dealer.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Создан:{" "}
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                  <UserActions
                    userId={user.id}
                    currentUserId={session.user.id}
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
