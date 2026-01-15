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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+77\d{9}$/, "Неверный формат. Используйте +77XXXXXXXXX"),
})

const otpSchema = z.object({
  otp: z.string().length(4, "Введите 4 цифры"),
})

const nameSchema = z.object({
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
})

type PhoneFormValues = z.infer<typeof phoneSchema>
type OTPFormValues = z.infer<typeof otpSchema>
type NameFormValues = z.infer<typeof nameSchema>

export default function ClientLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone")
  const [phone, setPhone] = useState("")
  const [isNewUser, setIsNewUser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "+77",
    },
  })

  const otpForm = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  })

  const onPhoneSubmit = async (values: PhoneFormValues) => {
    setIsLoading(true)
    setError("")

    try {
      const checkResponse = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: values.phone }),
      })

      const checkData = await checkResponse.json()

      if (!checkData.exists) {
        setIsNewUser(true)
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      setPhone(values.phone)
      setStep("otp")
    } catch (err) {
      setError("Ошибка отправки SMS")
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (values: OTPFormValues) => {
    setIsLoading(true)
    setError("")

    try {
      if (values.otp !== "1234") {
        setError("Неверный SMS код")
        setIsLoading(false)
        return
      }

      if (isNewUser) {
        setStep("name")
        setIsLoading(false)
        return
      }

      const result = await signIn("client-sms", {
        phone,
        smsCode: values.otp,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        otpForm.reset()
      } else if (result?.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Произошла ошибка при входе")
    } finally {
      setIsLoading(false)
    }
  }

  const onNameSubmit = async (values: NameFormValues) => {
    setIsLoading(true)
    setError("")

    try {
      const registerResponse = await fetch("/api/auth/register-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      })

      const registerData = await registerResponse.json()

      if (!registerResponse.ok) {
        throw new Error(registerData.error || "Ошибка регистрации")
      }

      const result = await signIn("client-sms", {
        phone,
        smsCode: "1234",
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при регистрации")
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
            Вход для клиентов
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === "phone"
                ? "Введите номер телефона"
                : step === "otp"
                ? "Введите код из SMS"
                : "Завершите регистрацию"}
            </CardTitle>
            <CardDescription>
              {step === "phone"
                ? "Мы отправим вам SMS с кодом подтверждения"
                : step === "otp"
                ? `Код отправлен на номер ${phone}`
                : "Укажите ваше имя и фамилию"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" ? (
              <Form {...phoneForm}>
                <form
                  onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={phoneForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Номер телефона</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+77XXXXXXXXX"
                            {...field}
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Получить код
                  </Button>
                </form>
              </Form>
            ) : step === "otp" ? (
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onOTPSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMS код</FormLabel>
                        <FormControl>
                          <div className="flex justify-center">
                            <InputOTP
                              maxLength={4}
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <div className="text-center text-sm text-muted-foreground mt-2">
                          Для тестирования используйте код: 1234
                        </div>
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otpForm.watch("otp").length !== 4}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isNewUser ? "Продолжить" : "Войти"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setStep("phone")
                        setError("")
                        otpForm.reset()
                      }}
                      disabled={isLoading}
                    >
                      Изменить номер
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...nameForm}>
                <form
                  onSubmit={nameForm.handleSubmit(onNameSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={nameForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя</FormLabel>
                        <FormControl>
                          <Input placeholder="Иван" {...field} autoFocus />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={nameForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Фамилия</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-sm text-destructive text-center">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Завершить регистрацию
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link
              href="/auth/admin-login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Вход для администраторов
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
