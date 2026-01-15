"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { formatPrice, formatCreditPayment } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { AuthModal } from "./AuthModal"
import { CreditApplicationModal } from "./CreditApplicationModal"

interface CreditCalculatorProps {
  carId: string
  carName: string
  carPrice: number
  dealerId: string
  annualRate?: number
}

type PaymentMethod = "credit" | "cash"

export function CreditCalculator({
  carId,
  carName,
  carPrice,
  dealerId,
  annualRate = 18,
}: CreditCalculatorProps) {
  const { data: session } = useSession()
  const minDownPayment = Math.round(carPrice * 0.2)
  const maxDownPayment = Math.round(carPrice * 0.8)

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit")
  const [downPayment, setDownPayment] = useState(minDownPayment)
  const [loanTerm, setLoanTerm] = useState(36)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isApplicationOpen, setIsApplicationOpen] = useState(false)

  const handlePurchaseClick = () => {
    // Если пользователь уже авторизован, показываем форму заявки
    if (session?.user) {
      setIsApplicationOpen(true)
      return
    }

    // Если не авторизован - показываем модалку авторизации
    setIsAuthOpen(true)
  }

  const loanAmount = carPrice - downPayment
  const monthlyPayment = formatCreditPayment(
    carPrice,
    downPayment,
    loanTerm,
    annualRate
  )
  const totalPayment = monthlyPayment * loanTerm + downPayment
  const overpayment = totalPayment - carPrice

  const downPaymentPercent = Math.round((downPayment / carPrice) * 100)

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Способ покупки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={paymentMethod === "credit" ? "default" : "outline"}
            onClick={() => setPaymentMethod("credit")}
            className="w-full"
          >
            Кредит
          </Button>
          <Button
            variant={paymentMethod === "cash" ? "default" : "outline"}
            onClick={() => setPaymentMethod("cash")}
            className="w-full"
          >
            Полная оплата
          </Button>
        </div>

        {paymentMethod === "credit" && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Первоначальный взнос</Label>
                <span className="font-semibold">
                  {formatPrice(downPayment)} ({downPaymentPercent}%)
                </span>
              </div>
              <Slider
                value={[downPayment]}
                onValueChange={(value) => setDownPayment(value[0] ?? minDownPayment)}
                min={minDownPayment}
                max={maxDownPayment}
                step={100000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatPrice(minDownPayment)}</span>
                <span>{formatPrice(maxDownPayment)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Срок кредита</Label>
                <span className="font-semibold">{loanTerm} мес.</span>
              </div>
              <Slider
                value={[loanTerm]}
                onValueChange={(value) => setLoanTerm(value[0] ?? 36)}
                min={12}
                max={84}
                step={12}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>12 мес.</span>
                <span>84 мес.</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Стоимость автомобиля
                </span>
                <span className="font-medium">{formatPrice(carPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Сумма кредита</span>
                <span className="font-medium">{formatPrice(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Процентная ставка</span>
                <span className="font-medium">{annualRate}%</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Ежемесячный платеж</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(monthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Общая сумма выплат</span>
                <span className="font-medium">{formatPrice(totalPayment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Переплата</span>
                <span className="font-medium text-destructive">
                  {formatPrice(overpayment)}
                </span>
              </div>
            </div>
          </>
        )}

        {paymentMethod === "cash" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Стоимость</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(carPrice)}
              </span>
            </div>
          </div>
        )}

        <Button className="w-full" size="lg" onClick={handlePurchaseClick}>
          {paymentMethod === "credit" ? "Рассчитать кредит" : "Купить"}
        </Button>
      </CardContent>
    </Card>

    <AuthModal
      open={isAuthOpen}
      onOpenChange={setIsAuthOpen}
      onSuccess={() => {
        // После успешной авторизации открываем форму заявки
        setTimeout(() => {
          setIsApplicationOpen(true)
        }, 300)
      }}
    />

    <CreditApplicationModal
      open={isApplicationOpen}
      onOpenChange={setIsApplicationOpen}
      carId={carId}
      carName={carName}
      carPrice={carPrice}
      downPayment={downPayment}
      loanTerm={loanTerm}
      monthlyPayment={monthlyPayment}
      dealerId={dealerId}
    />
  </>
  )
}
