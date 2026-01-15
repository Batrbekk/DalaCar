"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface UserActionsProps {
  userId: string
  currentUserId: string
}

export function UserActions({ userId, currentUserId }: UserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (userId === currentUserId) {
      alert("Вы не можете удалить самого себя")
      return
    }

    if (
      !confirm(
        "Вы уверены, что хотите удалить этого пользователя? Это действие необратимо."
      )
    ) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Ошибка при удалении")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
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
      disabled={loading || userId === currentUserId}
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Удалить
    </Button>
  )
}
