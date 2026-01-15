import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const carSchema = z.object({
  brand: z.string().min(2, "Марка должна быть минимум 2 символа"),
  model: z.string().min(1, "Модель обязательна"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  bodyType: z.enum(["SEDAN", "SUV", "HATCHBACK", "COUPE", "WAGON", "VAN"]),
  engine: z.string().min(1, "Двигатель обязателен"),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "ROBOT", "CVT"]),
  drive: z.enum(["FWD", "RWD", "AWD"]),
  power: z.number().int().min(1, "Мощность должна быть больше 0"),
  acceleration: z.number().optional(),
  fuelConsumption: z.number().optional(),
  seatingCapacity: z.number().int().min(1).max(9).default(5),
  trunkVolume: z.number().optional(),
  color: z.string().optional(),
  interiorColor: z.string().optional(),
  features: z.array(z.string()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
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

    return NextResponse.json({ success: true, cars })
  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const data = carSchema.parse(body)

    const car = await prisma.car.create({
      data,
    })

    return NextResponse.json({ success: true, car }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating car:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
