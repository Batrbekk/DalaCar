"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

interface Dealer {
  id: string
  name: string
}

export function UserForm({ dealers }: { dealers: Dealer[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "+77",
    password: "",
    role: "CLIENT" as "CLIENT" | "MANAGER" | "DEALER_ADMIN" | "SUPER_ADMIN",
    dealerId: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData: any = {
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      }

      if (formData.dealerId) {
        submitData.dealerId = formData.dealerId
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        setOpen(false)
        setFormData({
          name: "",
          phone: "+77",
          password: "",
          role: "CLIENT",
          dealerId: "",
        })
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Ошибка при создании пользователя")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Ошибка при создании пользователя")
    } finally {
      setLoading(false)
    }
  }

  const needsDealer = formData.role === "MANAGER" || formData.role === "DEALER_ADMIN"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+77XXXXXXXXX"
                required
                pattern="^\+77\d{9}$"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Роль *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, role: value, dealerId: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENT">Клиент</SelectItem>
                  <SelectItem value="MANAGER">Менеджер</SelectItem>
                  <SelectItem value="DEALER_ADMIN">Админ дилера</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Супер-админ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {needsDealer && (
              <div className="space-y-2">
                <Label htmlFor="dealerId">Дилер *</Label>
                <Select
                  value={formData.dealerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, dealerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите дилера" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealers.map((dealer) => (
                      <SelectItem key={dealer.id} value={dealer.id}>
                        {dealer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
