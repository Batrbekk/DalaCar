import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role === "CLIENT") {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const body = await request.json()
    const { status } = updateSchema.parse(body)

    const application = await prisma.application.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json({ success: true, application })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Неверные данные", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating application:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        car: true,
        dealer: true,
        manager: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Заявка не найдена" }, { status: 404 })
    }

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
