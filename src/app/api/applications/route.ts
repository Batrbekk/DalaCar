import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      carId,
      dealerId,
      name,
      phone,
      city,
      iin,
      salary,
      managerCode,
      message,
      carPrice,
      downPayment,
      loanTerm,
      monthlyPayment,
      creditScore,
    } = body

    // Валидация обязательных полей
    if (!carId || !dealerId || !name || !phone || !city || !iin || !salary) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Создание заявки
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        carId,
        dealerId,
        name,
        phone,
        city,
        iin,
        salary,
        managerCode: managerCode || null,
        message: message || null,
        carPrice,
        downPayment,
        loanTerm,
        monthlyPayment,
        creditScore,
        status: "NEW",
      },
      include: {
        car: true,
        dealer: true,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Получение всех заявок пользователя
    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        car: {
          include: {
            media: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        dealer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
