import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    if (path.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/admin-login", req.url))
      }

      if (token.role === "CLIENT") {
        return NextResponse.redirect(new URL("/", req.url))
      }

      if (path.startsWith("/dashboard/dealer") && token.role !== "DEALER_ADMIN" && token.role !== "MANAGER" && token.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      if (path.startsWith("/dashboard/admin") && token.role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        if (path.startsWith("/dashboard")) {
          return !!token && token.role !== "CLIENT"
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*"],
}
