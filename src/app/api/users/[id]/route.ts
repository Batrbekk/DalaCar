import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { hash } from "bcryptjs"

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^\+77\d{9}$/).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["CLIENT", "MANAGER", "DEALER_ADMIN", "SUPER_ADMIN"]).optional(),
  dealerId: z.string().nullable().optional(),
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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        dealer: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Error fetching user:", error)
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
    const data = updateUserSchema.parse(body)

    if (data.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: data.phone,
          id: { not: id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Пользователь с таким номером уже существует" },
          { status: 400 }
        )
      }
    }

    const updateData: any = { ...data }

    if (data.password) {
      updateData.password = await hash(data.password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        dealer: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
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

    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Вы не можете удалить самого себя" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
