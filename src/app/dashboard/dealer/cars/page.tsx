import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

export default async function DealerCarsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/admin-login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { dealer: true },
  })

  if (!user?.dealerId && session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Вы не привязаны ни к одному дилеру
        </p>
      </div>
    )
  }

  const dealerCars = await prisma.dealerCar.findMany({
    where: session.user.role === "SUPER_ADMIN"
      ? {}
      : { dealerId: user.dealerId! },
    include: {
      car: {
        include: {
          media: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Автомобили в продаже</h1>
        <p className="text-muted-foreground">
          Автомобили, которые вы продаете
        </p>
      </div>

      {dealerCars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Нет автомобилей в продаже</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dealerCars.map((dc) => (
            <Card key={dc.id}>
              <CardHeader>
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={dc.car.media[0]?.url || "/placeholder-car.svg"}
                    alt={`${dc.car.brand} ${dc.car.model}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle>
                  {dc.car.brand} {dc.car.model}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {dc.car.year} • {dc.car.engine} • {dc.car.power} л.с.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Цена:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(dc.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">В наличии:</span>
                  <Badge variant={dc.inStock ? "default" : "destructive"}>
                    {dc.inStock ? "Да" : "Нет"}
                  </Badge>
                </div>
                {dc.specialOffer && (
                  <Badge className="w-full justify-center">Спецпредложение</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
