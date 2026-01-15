import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import {
  LayoutDashboard,
  Building2,
  Car,
  Users,
  BarChart3,
} from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/admin-login")
  }

  const navItems = [
    { href: "/dashboard/admin", label: "Обзор", icon: LayoutDashboard },
    { href: "/dashboard/admin/dealers", label: "Дилеры", icon: Building2 },
    { href: "/dashboard/admin/cars", label: "Автомобили", icon: Car },
    { href: "/dashboard/admin/users", label: "Пользователи", icon: Users },
    { href: "/dashboard/admin/analytics", label: "Аналитика", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin">
              <h1 className="text-2xl font-bold text-primary">DalaCar</h1>
            </Link>
            <span className="text-sm text-muted-foreground">
              Супер-админ
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user.name}</span>
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
