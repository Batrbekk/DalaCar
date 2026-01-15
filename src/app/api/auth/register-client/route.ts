import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  phone: z.string().regex(/^\+77\d{9}$/),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, firstName, lastName } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким номером уже существует" },
        { status: 400 }
      )
    }

    const defaultPassword = await bcrypt.hash(Math.random().toString(36), 10)

    const user = await prisma.user.create({
      data: {
        phone,
        name: `${firstName} ${lastName}`,
        password: defaultPassword,
        role: "CLIENT",
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error registering client:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
