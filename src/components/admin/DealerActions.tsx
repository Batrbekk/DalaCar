"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Power } from "lucide-react"

interface DealerActionsProps {
  dealerId: string
  isActive: boolean
}

export function DealerActions({ dealerId, isActive }: DealerActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggleActive = async () => {
    if (!confirm(`Вы уверены, что хотите ${isActive ? "деактивировать" : "активировать"} этого дилера?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/dealers/${dealerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Ошибка при изменении статуса")
      }
    } catch (error) {
      console.error("Error toggling dealer status:", error)
      alert("Ошибка при изменении статуса")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого дилера? Это действие необратимо.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/dealers/${dealerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Ошибка при удалении")
      }
    } catch (error) {
      console.error("Error deleting dealer:", error)
      alert("Ошибка при удалении")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant={isActive ? "outline" : "default"}
        onClick={handleToggleActive}
        disabled={loading}
      >
        <Power className="h-4 w-4 mr-1" />
        {isActive ? "Деактивировать" : "Активировать"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Удалить
      </Button>
    </div>
  )
}
