import { prisma } from "@/lib/prisma"
import { CarCard } from "@/components/client/CarCard"
import { SearchBar } from "@/components/client/SearchBar"
import { Stories } from "@/components/client/Stories"

interface HomePageProps {
  searchParams: Promise<{
    query?: string
    brand?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const { query, brand } = params

  const dealerCars = await prisma.dealerCar.findMany({
    where: {
      inStock: true,
      car: {
        AND: [
          query
            ? {
                OR: [
                  { brand: { contains: query, mode: "insensitive" } },
                  { model: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          brand && brand !== "all" ? { brand } : {},
        ],
      },
    },
    include: {
      dealer: true,
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

  const stories = await prisma.story.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    include: {
      dealer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const dealerStories = stories.reduce((acc, story) => {
    const existing = acc.find((d) => d.dealerId === story.dealerId)
    if (existing) {
      existing.stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        duration: story.duration,
      })
    } else {
      acc.push({
        dealerId: story.dealerId,
        dealerName: story.dealer.name,
        dealerLogo: story.dealer.logo,
        viewedAt: null,
        stories: [
          {
            id: story.id,
            mediaUrl: story.mediaUrl,
            mediaType: story.mediaType,
            duration: story.duration,
          },
        ],
      })
    }
    return acc
  }, [] as Array<{ dealerId: string; dealerName: string; dealerLogo: string | null; viewedAt: Date | null; stories: Array<{ id: string; mediaUrl: string; mediaType: "IMAGE" | "VIDEO"; duration: number }> }>)

  const cars = await prisma.car.findMany({
    select: {
      brand: true,
      model: true
    },
    distinct: ["brand", "model"],
  })

  // Group models by brand
  const brandModels = cars.reduce((acc, car) => {
    if (!acc[car.brand]) {
      acc[car.brand] = []
    }
    if (!acc[car.brand]!.includes(car.model)) {
      acc[car.brand]!.push(car.model)
    }
    return acc
  }, {} as Record<string, string[]>)

  const brands = Object.keys(brandModels)

  const filteredCars = dealerCars.map((dc) => ({
    id: dc.car.id,
    brand: dc.car.brand,
    model: dc.car.model,
    year: dc.car.year,
    imageUrl: dc.car.media[0]?.url || null,
    priceFrom: dc.price,
    engine: dc.car.engine,
    transmission: dc.car.transmission,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-6 pb-20 max-w-md">

        {dealerStories.length > 0 && (
          <section className="mb-6">
            <Stories dealerStories={dealerStories} />
          </section>
        )}

        <section className="mb-6">
          <SearchBar brands={brands} brandModels={brandModels} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Популярные авто
          </h2>
          {filteredCars.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Автомобили не найдены. Попробуйте изменить параметры поиска.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCars.map((car) => (
                <CarCard key={car.id} {...car} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
