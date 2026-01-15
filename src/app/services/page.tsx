import { Construction } from "lucide-react"

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      <div className="container mx-auto px-4 max-w-md">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center mb-6">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Страница в разработке</h1>
          <p className="text-muted-foreground max-w-sm">
            Мы работаем над созданием раздела сервисов. Скоро здесь появится много полезного!
          </p>
        </div>
      </div>
    </div>
  )
}
