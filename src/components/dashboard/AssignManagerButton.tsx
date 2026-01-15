"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserPlus, Loader2 } from "lucide-react"

interface AssignManagerButtonProps {
  applicationId: string
}

export function AssignManagerButton({ applicationId }: AssignManagerButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAssign = async () => {
    if (!confirm("Взять эту заявку в работу?")) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/applications/${applicationId}/assign-manager`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to assign manager")
      }

      router.refresh()
    } catch (error) {
      console.error("Error assigning manager:", error)
      alert("Произошла ошибка при назначении менеджера")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleAssign}
      disabled={isLoading}
      className="w-full"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Назначение...
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Взять в работу
        </>
      )}
    </Button>
  )
}
