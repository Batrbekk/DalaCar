import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: "Телефон обязателен" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { phone },
    })

    return NextResponse.json({
      exists: !!user,
      isClient: user?.role === "CLIENT",
    })
  } catch (error) {
    console.error("Error checking user:", error)
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    )
  }
}
