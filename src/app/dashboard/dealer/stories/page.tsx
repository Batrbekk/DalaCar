import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Image from "next/image"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DealerStoriesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/admin-login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { dealer: true },
  })

  if (!user?.dealerId && session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Вы не привязаны ни к одному дилеру
        </p>
      </div>
    )
  }

  const stories = await prisma.story.findMany({
    where: session.user.role === "SUPER_ADMIN"
      ? {}
      : { dealerId: user.dealerId! },
    include: {
      dealer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const activeStories = stories.filter(
    (s) => s.isActive && (!s.expiresAt || s.expiresAt > new Date())
  )
  const expiredStories = stories.filter(
    (s) => !s.isActive || (s.expiresAt && s.expiresAt <= new Date())
  )

  const StoryCard = ({ story }: { story: typeof stories[0] }) => {
    const isExpired = story.expiresAt && story.expiresAt <= new Date()
    const isActive = story.isActive && !isExpired

    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{story.dealer.name}</CardTitle>
            <Badge variant={isActive ? "default" : "destructive"}>
              {isActive ? "Активна" : "Неактивна"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            {story.mediaType === "IMAGE" ? (
              <Image
                src={story.mediaUrl}
                alt="Story"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">VIDEO</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Тип:</span>
              <p className="font-medium">
                {story.mediaType === "IMAGE" ? "Фото" : "Видео"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Длительность:</span>
              <p className="font-medium">{story.duration} сек</p>
            </div>
            <div>
              <span className="text-muted-foreground">Создана:</span>
              <p className="font-medium">
                {new Date(story.createdAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
            {story.expiresAt && (
              <div>
                <span className="text-muted-foreground">Истекает:</span>
                <p className="font-medium">
                  {new Date(story.expiresAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Сторисы</h1>
        <p className="text-muted-foreground">
          Управление сторисами для привлечения клиентов
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Всего</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Активные</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {activeStories.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Истекшие</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">
              {expiredStories.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Активные сторисы ({activeStories.length})
          </h2>
          {activeStories.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">Нет активных сторисов</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>

        {expiredStories.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Истекшие сторисы ({expiredStories.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
