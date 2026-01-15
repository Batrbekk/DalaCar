"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Grid3x3, User } from "lucide-react"

export function BottomNav() {
  const pathname = usePathname()

  // Скрываем BottomNav на страницах dashboard и auth
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/auth")) {
    return null
  }

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Главная",
      active: pathname === "/",
    },
    {
      href: "/services",
      icon: Grid3x3,
      label: "Сервисы",
      active: pathname === "/services",
    },
    {
      href: "/profile",
      icon: User,
      label: "Профиль",
      active: pathname === "/profile",
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-inset-bottom">
      <div className="container mx-auto px-4 max-w-md">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 min-w-[60px] transition-colors ${
                  item.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className={`h-6 w-6 ${item.active ? "stroke-[2.5]" : ""}`} />
                <span className={`text-xs ${item.active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
