"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Phone, LogOut, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/client/AuthModal"
import { useState } from "react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const isLoading = status === "loading"

  // Проверяем заполненность профиля
  const isProfileIncomplete = session?.user && (
    !session.user.name ||
    session.user.name.startsWith("Пользователь")
  )

  if (isLoading) {
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

  if (!session?.user) {
    return (
      <>
        <div className="min-h-screen bg-background pt-14 pb-20">
          <div className="container mx-auto px-4 max-w-md">
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mb-6">
                <User className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-3">Профиль</h1>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Войдите, чтобы получить доступ к своему профилю и истории заявок
              </p>
              <Button
                onClick={() => setIsAuthOpen(true)}
                size="lg"
                className="w-full max-w-xs"
              >
                Войти в профиль
              </Button>
            </div>
          </div>
        </div>
        <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      <div className="container mx-auto px-4 max-w-md">
        {/* Header */}
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold">Профиль</h1>
        </div>

        <div className="space-y-4">
          {/* User Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold mb-1 truncate">
                    {isProfileIncomplete ? "Опасный водила" : session.user.name}
                  </h2>
                  {session.user.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">
                        {session.user.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Actions */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                <button
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    // TODO: Implement edit profile
                    alert("Редактирование профиля будет доступно в следующей версии")
                  }}
                >
                  <span className="font-medium">Редактировать профиль</span>
                  <span className="text-muted-foreground">→</span>
                </button>
                <Link
                  href="/profile/applications"
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">Мои заявки</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Logout Button */}
          <Button
            variant="outline"
            className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  )
}
