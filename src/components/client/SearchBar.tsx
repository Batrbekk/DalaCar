"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchBarProps {
  brands: string[]
  brandModels: Record<string, string[]>
}

export interface SearchFilters {
  query: string
  brand: string
}

export function SearchBar({ brands, brandModels }: SearchBarProps) {
  const router = useRouter()
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")

  const handleBrandChange = (value: string) => {
    setBrand(value)
    setModel("") // Reset model when brand changes
  }

  const handleSearch = () => {
    const searchParams = new URLSearchParams()
    if (model) searchParams.set("query", model)
    if (brand && brand !== "all") searchParams.set("brand", brand)
    router.push(`/?${searchParams.toString()}`)
  }

  const handleReset = () => {
    setBrand("")
    setModel("")
    router.push("/")
  }

  const availableModels = brand && brand !== "all" ? brandModels[brand] || [] : []

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <Select value={brand} onValueChange={handleBrandChange}>
        <SelectTrigger className="bg-white border-gray-200 h-12">
          <SelectValue placeholder="Выберите марку" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все марки</SelectItem>
          {brands.map((brandName) => (
            <SelectItem key={brandName} value={brandName}>
              {brandName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {brand && brand !== "all" && availableModels.length > 0 && (
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="bg-white border-gray-200 h-12">
            <SelectValue placeholder="Выберите модель" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все модели</SelectItem>
            {availableModels.map((modelName) => (
              <SelectItem key={modelName} value={modelName}>
                {modelName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1 h-12 text-base font-medium">
          Найти
        </Button>
        <Button onClick={handleReset} variant="outline" size="icon" className="h-12 w-12">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
