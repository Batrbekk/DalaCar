import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { hash } from "bcryptjs"

const userSchema = z.object({
  name: z.string().min(2, "Имя должно быть минимум 2 символа"),
  phone: z.string().regex(/^\+77\d{9}$/, "Неверный формат телефона"),
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
  role: z.enum(["CLIENT", "MANAGER", "DEALER_ADMIN", "SUPER_ADMIN"]),
  dealerId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      include: {
        dealer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error("Error fetching users:", error)
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
    const { name, phone, password, role, dealerId } = userSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким номером уже существует" },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role,
        dealerId,
      },
      include: {
        dealer: true,
      },
    })

    return NextResponse.json({ success: true, user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
