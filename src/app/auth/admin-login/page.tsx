"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Неверный формат email"),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
})

type FormValues = z.infer<typeof formSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("admin-credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err) {
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">DalaCar</h1>
          <p className="text-sm text-muted-foreground">
            Панель администратора
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Вход для администраторов</CardTitle>
            <CardDescription>
              Введите email и пароль для входа в систему
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="admin@dalacar.kz"
                          {...field}
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}

                <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Тестовые аккаунты:</p>
                  <ul className="space-y-1 text-xs">
                    <li>admin@dalacar.kz / admin123 (Супер-админ)</li>
                    <li>dealer@dalacar.kz / admin123 (Админ дилера)</li>
                    <li>manager@dalacar.kz / admin123 (Менеджер)</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Войти
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link
              href="/auth/client-login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Вход для клиентов
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
