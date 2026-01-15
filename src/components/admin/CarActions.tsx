"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface CarActionsProps {
  carId: string
}

export function CarActions({ carId }: CarActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить этот автомобиль? Это действие необратимо."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Ошибка при удалении")
      }
    } catch (error) {
      console.error("Error deleting car:", error)
      alert("Ошибка при удалении")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Удалить
    </Button>
  )
}
