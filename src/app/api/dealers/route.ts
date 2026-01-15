import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const dealerSchema = z.object({
  name: z.string().min(2, "Название должно быть минимум 2 символа"),
  description: z.string().optional(),
  address: z.string().min(5, "Адрес должен быть минимум 5 символов"),
  phone: z.string().regex(/^\+77\d{9}$/, "Неверный формат телефона"),
  email: z.string().email("Неверный формат email"),
  logo: z.string().url("Неверный формат URL логотипа").optional(),
  isActive: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const dealers = await prisma.dealer.findMany({
      include: {
        _count: {
          select: {
            users: true,
            cars: true,
            applications: true,
            sales: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, dealers })
  } catch (error) {
    console.error("Error fetching dealers:", error)
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
    const data = dealerSchema.parse(body)

    const dealer = await prisma.dealer.create({
      data,
    })

    return NextResponse.json({ success: true, dealer }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating dealer:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
