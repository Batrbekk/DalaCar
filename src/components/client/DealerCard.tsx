"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ApplicationForm } from "./ApplicationForm"

interface DealerCardProps {
  dealerId: string
  dealerName: string
  dealerCity: string
  dealerAddress: string
  dealerPhone: string
  price: number
  carId: string
  carName: string
}

export function DealerCard({
  dealerId,
  dealerName,
  dealerCity,
  dealerAddress,
  dealerPhone,
  price,
  carId,
  carName,
}: DealerCardProps) {
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{dealerName}</h3>
                <p className="text-sm text-muted-foreground">
                  {dealerCity}, {dealerAddress}
                </p>
              </div>
              <p className="text-lg font-bold text-primary">
                {formatPrice(price)}
              </p>
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button className="flex-1" asChild>
                <a href={`tel:${dealerPhone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Позвонить
                </a>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowApplicationForm(true)}
              >
                Оставить заявку
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApplicationForm
        open={showApplicationForm}
        onOpenChange={setShowApplicationForm}
        carId={carId}
        dealerId={dealerId}
        carName={carName}
        dealerName={dealerName}
      />
    </>
  )
}
