"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthModal } from "./AuthModal"

export function Navbar() {
  const { data: session } = useSession()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-border z-50">
        <div className="container mx-auto px-4 max-w-md">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="font-bold text-lg">DalaCar</span>
            </div>

            {/* Auth Button */}
            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{session.user.name}</span>
                  <span className="text-xs text-muted-foreground">{session.user.phone}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="h-8 w-8"
                  title="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span>Войти</span>
              </Button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />
    </>
  )
}