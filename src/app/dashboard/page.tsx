import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/admin-login")
  }

  switch (session.user.role) {
    case "SUPER_ADMIN":
      redirect("/dashboard/admin")
    case "DEALER_ADMIN":
      redirect("/dashboard/dealer")
    case "MANAGER":
      redirect("/dashboard/dealer")
    default:
      redirect("/")
  }
}
