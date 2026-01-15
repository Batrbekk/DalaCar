"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, formatCreditPayment } from "@/lib/utils"

interface CarCardProps {
  id: string
  brand: string
  model: string
  year: number
  imageUrl: string | null
  priceFrom: number
  engine: string
  transmission: string
}

export function CarCard({
  id,
  brand,
  model,
  year,
  imageUrl,
  priceFrom,
  engine,
  transmission,
}: CarCardProps) {
  const creditPayment = formatCreditPayment(priceFrom, priceFrom * 0.2, 60)

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
      <Link href={`/cars/${id}`}>
        <div className="relative w-full h-48">
          <Image
            src={imageUrl || "/placeholder-car.svg"}
            alt={`${brand} ${model}`}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 100vw, 320px"
          />
          <div className="absolute top-3 right-3">
            <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm">
              {year}
            </Badge>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {brand} {model}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {engine} • {transmission}
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              от {formatPrice(priceFrom)}
            </p>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0 font-medium">
                В кредит от {formatPrice(creditPayment)}/мес
              </Badge>
            </div>
          </div>
          <Link href={`/cars/${id}`} className="mt-4 block">
            <Button
              className="w-full h-11 font-medium"
              size="lg"
            >
              Подробнее
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
