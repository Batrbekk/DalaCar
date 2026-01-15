import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "MANAGER" && session.user.role !== "DEALER_ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        managerId: session.user.id,
        status: "IN_PROGRESS",
      },
      include: {
        car: true,
        dealer: true,
        manager: true,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error assigning manager:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
