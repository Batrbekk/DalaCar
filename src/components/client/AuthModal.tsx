"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { Phone, ArrowRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const formatPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as +7 (XXX) XXX-XX-XX
    if (digits.startsWith("7")) {
      const formatted = digits.slice(1)
      let result = "+7"
      if (formatted.length > 0) result += ` (${formatted.slice(0, 3)}`
      if (formatted.length >= 3) result += ")"
      if (formatted.length > 3) result += ` ${formatted.slice(3, 6)}`
      if (formatted.length > 6) result += `-${formatted.slice(6, 8)}`
      if (formatted.length > 8) result += `-${formatted.slice(8, 10)}`
      return result
    } else if (digits.startsWith("8")) {
      return formatPhone("7" + digits.slice(1))
    } else if (digits.length > 0) {
      return formatPhone("7" + digits)
    }
    return "+7"
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSendCode = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    setStep("code")
  }

  const handleVerifyCode = async () => {
    setLoading(true)
    setError("")

    try {
      const result = await signIn("client-sms", {
        phone: phone.replace(/\D/g, ""),
        smsCode: code,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный код. Попробуйте еще раз.")
        setLoading(false)
        return
      }

      // Успешная авторизация
      onOpenChange(false)

      // Reset form
      setPhone("")
      setCode("")
      setStep("phone")
      setError("")

      // Вызываем callback если он есть
      if (onSuccess) {
        onSuccess()
      } else {
        // Если callback не указан, перезагружаем страницу
        window.location.reload()
      }
    } catch (err) {
      setError("Произошла ошибка. Попробуйте еще раз.")
    } finally {
      setLoading(false)
    }
  }

  const isPhoneValid = phone.replace(/\D/g, "").length === 11

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-[24px] px-0"
      >
        <div className="mx-auto w-full max-w-md px-6">
          <SheetHeader className="pb-6">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center">
                <Phone className="h-8 w-8 text-white" />
              </div>
            </div>
            <SheetTitle className="text-2xl text-center">
              {step === "phone" ? "Вход в DalaCar" : "Подтверждение"}
            </SheetTitle>
            <p className="text-center text-muted-foreground text-sm mt-2">
              {step === "phone"
                ? "Введите номер телефона для входа"
                : `Код отправлен на ${phone}`}
            </p>
          </SheetHeader>

          <div className="space-y-4">
            {step === "phone" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="phone">Номер телефона</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (700) 000-00-00"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="text-lg h-12"
                    maxLength={18}
                  />
                  <p className="text-xs text-muted-foreground">
                    На этот номер придет SMS с кодом подтверждения
                  </p>
                </div>

                <Button
                  onClick={handleSendCode}
                  disabled={!isPhoneValid || loading}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Отправка...
                    </div>
                  ) : (
                    <>
                      Получить код
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <Label htmlFor="code" className="text-center block">Код из SMS</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={code}
                      onChange={(value) => setCode(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="w-14 h-14 text-2xl" />
                        <InputOTPSlot index={1} className="w-14 h-14 text-2xl" />
                        <InputOTPSlot index={2} className="w-14 h-14 text-2xl" />
                        <InputOTPSlot index={3} className="w-14 h-14 text-2xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone")
                      setError("")
                      setCode("")
                    }}
                    className="text-sm text-primary hover:underline block text-center w-full"
                  >
                    Изменить номер
                  </button>
                </div>

                <Button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 4 || loading}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Проверка...
                    </div>
                  ) : (
                    "Подтвердить"
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={handleSendCode}
                    disabled={loading}
                  >
                    Отправить код повторно
                  </button>
                </div>
              </>
            )}

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Продолжая, вы соглашаетесь с{" "}
                <a href="#" className="text-primary hover:underline">
                  условиями использования
                </a>{" "}
                и{" "}
                <a href="#" className="text-primary hover:underline">
                  политикой конфиденциальности
                </a>
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}