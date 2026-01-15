import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateDealerSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().min(5).optional(),
  phone: z.string().regex(/^\+77\d{9}$/).optional(),
  email: z.string().email().optional(),
  logo: z.string().url().optional(),
  isActive: z.boolean().optional(),
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

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: {
        users: true,
        cars: true,
        applications: true,
        sales: true,
        stories: true,
      },
    })

    if (!dealer) {
      return NextResponse.json({ error: "Дилер не найден" }, { status: 404 })
    }

    return NextResponse.json({ success: true, dealer })
  } catch (error) {
    console.error("Error fetching dealer:", error)
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
    const data = updateDealerSchema.parse(body)

    const dealer = await prisma.dealer.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, dealer })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating dealer:", error)
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

    await prisma.dealer.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting dealer:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
