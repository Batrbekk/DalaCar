"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  phone: z
    .string()
    .regex(/^\+77\d{9}$/, "Неверный формат телефона. Используйте +77XXXXXXXXX"),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  message: z.string().optional(),
  managerCode: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface ApplicationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  carId: string
  dealerId: string
  carName: string
  dealerName: string
}

export function ApplicationForm({
  open,
  onOpenChange,
  carId,
  dealerId,
  carName,
  dealerName,
}: ApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "+77",
      email: "",
      message: "",
      managerCode: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId,
          dealerId,
          ...values,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при отправке заявки")
      }

      setIsSuccess(true)
      form.reset()

      setTimeout(() => {
        setIsSuccess(false)
        onOpenChange(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting application:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при отправке заявки"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Оставить заявку</DialogTitle>
          <DialogDescription>
            {carName} • {dealerName}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-semibold mb-2">Заявка отправлена!</h3>
            <p className="text-sm text-muted-foreground">
              Мы свяжемся с вами в ближайшее время
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ваше имя *</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ваше имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон *</FormLabel>
                    <FormControl>
                      <Input placeholder="+77XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Код менеджера</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Если есть (необязательно)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сообщение</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Дополнительная информация (необязательно)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Отправить заявку
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
