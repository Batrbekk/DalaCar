import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "client-sms",
      name: "Вход по SMS",
      credentials: {
        phone: { label: "Телефон", type: "text" },
        smsCode: { label: "SMS код", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.smsCode) {
          throw new Error("Введите телефон и SMS код")
        }

        if (credentials.smsCode !== process.env.SMS_MOCK_CODE) {
          throw new Error("Неверный SMS код")
        }

        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        })

        // Автоматически создаем пользователя, если его нет
        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              role: "CLIENT",
              name: `Пользователь ${credentials.phone.slice(-4)}`,
              password: "", // Пустой пароль для клиентов (они используют SMS)
            },
          })
        }

        if (user.role !== "CLIENT") {
          throw new Error("Используйте вход для администраторов")
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        }
      },
    }),
    CredentialsProvider({
      id: "admin-credentials",
      name: "Вход для администраторов",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Введите email и пароль")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error("Пользователь не найден")
        }

        if (user.role === "CLIENT") {
          throw new Error("Используйте вход по SMS")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Неверный пароль")
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 90 * 24 * 60 * 60, // 90 дней (3 месяца)
  },
  jwt: {
    maxAge: 90 * 24 * 60 * 60, // 90 дней (3 месяца)
  },
}
