import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateCarSchema = z.object({
  brand: z.string().min(2).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  bodyType: z.enum(["SEDAN", "SUV", "HATCHBACK", "COUPE", "WAGON", "VAN"]).optional(),
  engine: z.string().min(1).optional(),
  transmission: z.enum(["MANUAL", "AUTOMATIC", "ROBOT", "CVT"]).optional(),
  drive: z.enum(["FWD", "RWD", "AWD"]).optional(),
  power: z.number().int().min(1).optional(),
  acceleration: z.number().optional(),
  fuelConsumption: z.number().optional(),
  seatingCapacity: z.number().int().min(1).max(9).optional(),
  trunkVolume: z.number().optional(),
  color: z.string().optional(),
  interiorColor: z.string().optional(),
  features: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        media: true,
        dealers: true,
        applications: true,
      },
    })

    if (!car) {
      return NextResponse.json({ error: "Автомобиль не найден" }, { status: 404 })
    }

    return NextResponse.json({ success: true, car })
  } catch (error) {
    console.error("Error fetching car:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const data = updateCarSchema.parse(body)

    const car = await prisma.car.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, car })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating car:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    await prisma.car.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting car:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
