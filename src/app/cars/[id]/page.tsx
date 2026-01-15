import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Calendar, Gauge, Fuel, Settings } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { CarGallery } from "@/components/client/CarGallery"
import { CreditCalculator } from "@/components/client/CreditCalculator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface CarPageProps {
  params: Promise<{
    id: string
  }>
}

const bodyTypeLabels = {
  SEDAN: "Седан",
  SUV: "Внедорожник",
  HATCHBACK: "Хэтчбек",
  COUPE: "Купе",
  WAGON: "Универсал",
  VAN: "Минивэн",
}

const transmissionLabels = {
  MANUAL: "Механика",
  AUTOMATIC: "Автомат",
  ROBOT: "Робот",
  CVT: "Вариатор",
}

const driveLabels = {
  FWD: "Передний",
  RWD: "Задний",
  AWD: "Полный",
}

export default async function CarPage({ params }: CarPageProps) {
  const { id } = await params

  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
      },
      dealers: {
        include: {
          dealer: true,
        },
        where: {
          inStock: true,
        },
        orderBy: {
          price: "asc",
        },
      },
    },
  })

  if (!car) {
    notFound()
  }

  const lowestPrice = car.dealers.length > 0 ? car.dealers[0].price : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20 max-w-md">
        <div className="mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад к каталогу
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <CarGallery
            media={car.media.map((m) => ({
              id: m.id,
              url: m.url,
              type: m.type,
              isPrimary: m.isPrimary,
            }))}
            carName={`${car.brand} ${car.model}`}
          />

          <div>
            <h1 className="text-2xl font-bold mb-2">
              {car.brand} {car.model} {car.year}
            </h1>
            {lowestPrice > 0 && (
              <p className="text-3xl font-bold text-primary">
                от {formatPrice(lowestPrice)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{car.year} год</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <span>{car.power} л.с.</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Fuel className="h-4 w-4 text-muted-foreground" />
              <span>{car.engine}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>{transmissionLabels[car.transmission]}</span>
            </div>
          </div>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Технические характеристики</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Марка</span>
                <span className="font-medium">{car.brand}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Модель</span>
                <span className="font-medium">{car.model}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Год выпуска</span>
                <span className="font-medium">{car.year}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Тип кузова</span>
                <span className="font-medium">{bodyTypeLabels[car.bodyType]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Двигатель</span>
                <span className="font-medium">{car.engine}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Мощность</span>
                <span className="font-medium">{car.power} л.с.</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Трансмиссия</span>
                <span className="font-medium">{transmissionLabels[car.transmission]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Привод</span>
                <span className="font-medium">{driveLabels[car.drive]}</span>
              </div>
              {car.acceleration && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Разгон 0-100</span>
                  <span className="font-medium">{car.acceleration} сек</span>
                </div>
              )}
              {car.fuelConsumption && car.fuelConsumption > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Расход топлива</span>
                  <span className="font-medium">{car.fuelConsumption} л/100км</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Вместимость</span>
                <span className="font-medium">{car.seatingCapacity} мест</span>
              </div>
              {car.trunkVolume && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Объем багажника</span>
                  <span className="font-medium">{car.trunkVolume} л</span>
                </div>
              )}
              {car.color && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Цвет кузова</span>
                    <span className="font-medium">{car.color}</span>
                  </div>
                </>
              )}
              {car.interiorColor && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Цвет салона</span>
                  <span className="font-medium">{car.interiorColor}</span>
                </div>
              )}
              {car.features && car.features.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Особенности:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Дилерский центр</CardTitle>
              <p className="text-sm text-muted-foreground">
                Для продолжения покупки выберите дилерский центр
              </p>
            </CardHeader>
            <CardContent>
              {car.dealers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Данный автомобиль пока не представлен у дилеров
                </div>
              ) : (
                <div className="space-y-2">
                  {car.dealers.map((dc) => (
                    <label
                      key={dc.id}
                      className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                    >
                      <input
                        type="radio"
                        name="dealer"
                        value={dc.id}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{dc.dealer.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {dc.dealer.address}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(dc.price)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {lowestPrice > 0 && car.dealers.length > 0 && (
            <CreditCalculator
              carId={car.id}
              carName={`${car.brand} ${car.model} ${car.year}`}
              carPrice={lowestPrice}
              dealerId={car.dealers[0].dealerId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
