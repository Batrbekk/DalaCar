import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Image from "next/image"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CarForm } from "@/components/admin/CarForm"
import { CarActions } from "@/components/admin/CarActions"
import { Car, FileText } from "lucide-react"

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

export default async function AdminCarsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/auth/admin-login")
  }

  const cars = await prisma.car.findMany({
    include: {
      media: {
        where: { isPrimary: true },
        take: 1,
      },
      _count: {
        select: {
          dealers: true,
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Управление автомобилями
          </h1>
          <p className="text-muted-foreground">
            База автомобилей платформы
          </p>
        </div>
        <CarForm />
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Всего автомобилей</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{cars.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">В продаже</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {cars.filter((c) => c._count.dealers > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">С заявками</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {cars.filter((c) => c._count.applications > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Нет автомобилей в базе</p>
          <CarForm />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <Card key={car.id}>
              <CardHeader>
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={car.media[0]?.url || "/placeholder-car.svg"}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle>
                  {car.brand} {car.model}
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">
                    {bodyTypeLabels[car.bodyType]}
                  </Badge>
                  <Badge variant="outline">{car.year}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Двигатель:</span>
                    <p className="font-medium">{car.engine}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Мощность:</span>
                    <p className="font-medium">{car.power} л.с.</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">КПП:</span>
                    <p className="font-medium">
                      {transmissionLabels[car.transmission]}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Привод:</span>
                    <p className="font-medium">{driveLabels[car.drive]}</p>
                  </div>
                </div>

                {car.acceleration && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">0-100 км/ч:</span>
                    <span className="font-medium ml-2">
                      {car.acceleration} сек
                    </span>
                  </div>
                )}

                {car.fuelConsumption && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Расход:</span>
                    <span className="font-medium ml-2">
                      {car.fuelConsumption} л/100км
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t text-sm">
                  <div className="flex items-center gap-1">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{car._count.dealers}</span>
                    <span className="text-muted-foreground">дилеров</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {car._count.applications}
                    </span>
                    <span className="text-muted-foreground">заявок</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Добавлен:{" "}
                    {new Date(car.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                  <CarActions carId={car.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
