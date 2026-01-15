import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatCreditPayment(
  price: number,
  downPayment: number,
  loanTerm: number,
  annualRate: number = 18
): number {
  const loanAmount = price - downPayment
  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) /
    (Math.pow(1 + monthlyRate, loanTerm) - 1)
  return Math.round(monthlyPayment)
}
