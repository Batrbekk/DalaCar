"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ApplicationStatusButtonProps {
  applicationId: string
  currentStatus: string
}

export function ApplicationStatusButton({
  applicationId,
  currentStatus,
}: ApplicationStatusButtonProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    setStatus(newStatus)

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Ошибка обновления статуса")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating status:", error)
      setStatus(currentStatus)
      alert("Ошибка при обновлении статуса")
    } finally {
      setIsLoading(false)
    }
  }

  const statuses = [
    { value: "NEW", label: "Новая" },
    { value: "IN_PROGRESS", label: "В работе" },
    { value: "COMPLETED", label: "Завершена" },
    { value: "CANCELLED", label: "Отменена" },
  ]

  return (
    <div className="flex gap-2">
      <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  )
}
