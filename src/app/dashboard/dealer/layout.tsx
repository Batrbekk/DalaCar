import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import {
  LayoutDashboard,
  Car,
  Image as ImageIcon,
  BarChart3
} from "lucide-react"

export default async function DealerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "DEALER_ADMIN" && session.user.role !== "MANAGER" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/auth/admin-login")
  }

  // Разные пункты меню для менеджеров и админов
  const navItems = session.user.role === "MANAGER"
    ? [
        { href: "/dashboard/dealer", label: "Заявки", icon: LayoutDashboard },
        { href: "/dashboard/dealer/stats", label: "Моя статистика", icon: BarChart3 },
      ]
    : [
        { href: "/dashboard/dealer", label: "Заявки", icon: LayoutDashboard },
        { href: "/dashboard/dealer/cars", label: "Автомобили", icon: Car },
        { href: "/dashboard/dealer/stories", label: "Сторисы", icon: ImageIcon },
        { href: "/dashboard/dealer/stats", label: "Статистика", icon: BarChart3 },
      ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/dealer">
              <h1 className="text-2xl font-bold text-primary">DalaCar</h1>
            </Link>
            <span className="text-sm text-muted-foreground">
              {session.user.role === "SUPER_ADMIN" ? "Супер-админ" :
               session.user.role === "DEALER_ADMIN" ? "Админ дилера" : "Менеджер"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{session.user.name}</p>
              {session.user.role === "MANAGER" && session.user.id && (
                <p className="text-xs text-muted-foreground">Код: {session.user.id.slice(-6).toUpperCase()}</p>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav className="mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </nav>

        <main>{children}</main>
      </div>
    </div>
  )
}
