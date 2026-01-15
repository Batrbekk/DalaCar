"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle2, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"

interface CreditApplicationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carId: string
  carName: string
  carPrice: number
  downPayment: number
  loanTerm: number
  monthlyPayment: number
  dealerId: string
}

type Step = "form" | "scoring" | "success"

export function CreditApplicationModal({
  open,
  onOpenChange,
  carId,
  carName,
  carPrice,
  downPayment,
  loanTerm,
  monthlyPayment,
  dealerId,
}: CreditApplicationModalProps) {
  const { data: session } = useSession()
  const [step, setStep] = useState<Step>("form")
  const [loading, setLoading] = useState(false)
  const [creditScore, setCreditScore] = useState(0)

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    phone: session?.user?.phone || "",
    city: "",
    iin: "",
    salary: "",
    managerCode: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStep("scoring")

    // Симуляция скоринга с анимацией
    let score = 0
    const targetScore = Math.floor(Math.random() * 200) + 700 // 700-900
    const interval = setInterval(() => {
      score += Math.floor(Math.random() * 30) + 10
      if (score >= targetScore) {
        score = targetScore
        clearInterval(interval)
        setTimeout(() => {
          setCreditScore(score)
          submitApplication(score)
        }, 500)
      }
      setCreditScore(score)
    }, 100)
  }

  const submitApplication = async (score: number) => {
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId,
          dealerId,
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          iin: formData.iin,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          managerCode: formData.managerCode,
          message: formData.message,
          carPrice,
          downPayment,
          loanTerm,
          monthlyPayment,
          creditScore: score,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create application")
      }

      setStep("success")
    } catch (error) {
      console.error("Error creating application:", error)
      alert("Произошла ошибка при создании заявки")
      setStep("form")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("form")
    setCreditScore(0)
    setFormData({
      name: session?.user?.name || "",
      phone: session?.user?.phone || "",
      city: "",
      iin: "",
      salary: "",
      managerCode: "",
      message: "",
    })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-[24px] px-0">
        <div className="mx-auto w-full max-w-md px-6 h-full flex flex-col">
          {step === "form" && (
            <>
              <SheetHeader className="pb-6">
                <SheetTitle className="text-2xl">Заявка на кредит</SheetTitle>
                <SheetDescription>
                  Заполните форму для оформления кредита на {carName}
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 pb-4">
                  {/* Информация о кредите */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Стоимость автомобиля</span>
                      <span className="font-medium">{formatPrice(carPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Первоначальный взнос</span>
                      <span className="font-medium">{formatPrice(downPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Срок кредита</span>
                      <span className="font-medium">{loanTerm} мес.</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Ежемесячный платеж</span>
                      <span className="font-bold text-primary">{formatPrice(monthlyPayment)}</span>
                    </div>
                  </div>

                  {/* Форма */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="name">ФИО</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Введите ваше полное имя"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+7 (700) 000-00-00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Например, Алматы"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="iin">ИИН</Label>
                      <Input
                        id="iin"
                        value={formData.iin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "")
                          if (value.length <= 12) {
                            setFormData({ ...formData, iin: value })
                          }
                        }}
                        placeholder="123456789012"
                        maxLength={12}
                        required
                      />
                      <p className="text-xs text-muted-foreground">12 цифр</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Ежемесячный доход (₸)</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="500000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="managerCode">Код менеджера (необязательно)</Label>
                      <Input
                        id="managerCode"
                        value={formData.managerCode}
                        onChange={(e) => setFormData({ ...formData, managerCode: e.target.value })}
                        placeholder="Введите код, если есть"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Дополнительная информация (необязательно)</Label>
                      <Input
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Любые комментарии или вопросы"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 pb-2 border-t bg-white">
                  <Button type="submit" className="w-full h-12 text-base" size="lg">
                    Отправить заявку
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === "scoring" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-32 h-32 relative mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">{creditScore}</div>
                    <div className="text-xs text-muted-foreground">баллов</div>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Проверка кредитной истории</h2>
              <p className="text-muted-foreground mb-6">
                Пожалуйста, подождите. Мы анализируем вашу заявку...
              </p>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}

          {step === "success" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Ваша покупка оформлена!</h2>
              <p className="text-muted-foreground mb-2 max-w-sm">
                Ваша заявка успешно отправлена. Наш менеджер свяжется с вами в ближайшее время.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-900">Кредитный скоринг</span>
                  <span className="text-2xl font-bold text-green-600">{creditScore}</span>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full max-w-xs" size="lg">
                Вернуться к каталогу
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
