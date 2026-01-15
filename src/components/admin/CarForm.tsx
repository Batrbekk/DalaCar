"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function CarForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    bodyType: "SEDAN" as const,
    engine: "",
    transmission: "AUTOMATIC" as const,
    drive: "FWD" as const,
    power: 0,
    acceleration: 0,
    fuelConsumption: 0,
    seatingCapacity: 5,
    trunkVolume: 0,
    color: "",
    interiorColor: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setOpen(false)
        setFormData({
          brand: "",
          model: "",
          year: new Date().getFullYear(),
          bodyType: "SEDAN",
          engine: "",
          transmission: "AUTOMATIC",
          drive: "FWD",
          power: 0,
          acceleration: 0,
          fuelConsumption: 0,
          seatingCapacity: 5,
          trunkVolume: 0,
          color: "",
          interiorColor: "",
        })
        router.refresh()
      } else {
        const data = await response.json()
        alert(data.error || "Ошибка при создании автомобиля")
      }
    } catch (error) {
      console.error("Error creating car:", error)
      alert("Ошибка при создании автомобиля")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Добавить автомобиль
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новый автомобиль</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Марка *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Модель *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Год *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                required
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bodyType">Тип кузова *</Label>
              <Select
                value={formData.bodyType}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, bodyType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SEDAN">Седан</SelectItem>
                  <SelectItem value="SUV">Внедорожник</SelectItem>
                  <SelectItem value="HATCHBACK">Хэтчбек</SelectItem>
                  <SelectItem value="COUPE">Купе</SelectItem>
                  <SelectItem value="WAGON">Универсал</SelectItem>
                  <SelectItem value="VAN">Минивэн</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="power">Мощность (л.с.) *</Label>
              <Input
                id="power"
                type="number"
                value={formData.power}
                onChange={(e) =>
                  setFormData({ ...formData, power: parseInt(e.target.value) })
                }
                required
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="engine">Двигатель *</Label>
              <Input
                id="engine"
                value={formData.engine}
                onChange={(e) =>
                  setFormData({ ...formData, engine: e.target.value })
                }
                placeholder="2.0 л, бензин"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transmission">КПП *</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, transmission: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">Механика</SelectItem>
                  <SelectItem value="AUTOMATIC">Автомат</SelectItem>
                  <SelectItem value="ROBOT">Робот</SelectItem>
                  <SelectItem value="CVT">Вариатор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="drive">Привод *</Label>
              <Select
                value={formData.drive}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, drive: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FWD">Передний</SelectItem>
                  <SelectItem value="RWD">Задний</SelectItem>
                  <SelectItem value="AWD">Полный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="acceleration">Разгон 0-100 (сек)</Label>
              <Input
                id="acceleration"
                type="number"
                step="0.1"
                value={formData.acceleration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    acceleration: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelConsumption">Расход (л/100км)</Label>
              <Input
                id="fuelConsumption"
                type="number"
                step="0.1"
                value={formData.fuelConsumption}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fuelConsumption: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seatingCapacity">Мест *</Label>
              <Input
                id="seatingCapacity"
                type="number"
                value={formData.seatingCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seatingCapacity: parseInt(e.target.value),
                  })
                }
                required
                min={1}
                max={9}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trunkVolume">Багажник (л)</Label>
              <Input
                id="trunkVolume"
                type="number"
                value={formData.trunkVolume}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trunkVolume: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Цвет кузова</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interiorColor">Цвет салона</Label>
              <Input
                id="interiorColor"
                value={formData.interiorColor}
                onChange={(e) =>
                  setFormData({ ...formData, interiorColor: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Создание..." : "Создать"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
