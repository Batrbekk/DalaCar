"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface Story {
  id: string
  mediaUrl: string
  mediaType: "IMAGE" | "VIDEO"
  duration: number
}

interface DealerStory {
  dealerId: string
  dealerName: string
  dealerLogo: string | null
  stories: Story[]
  viewedAt: Date | null
}

interface StoriesProps {
  dealerStories: DealerStory[]
}

export function Stories({ dealerStories }: StoriesProps) {
  const [selectedDealer, setSelectedDealer] = useState<number | null>(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  const currentDealer = selectedDealer !== null ? dealerStories[selectedDealer] : null
  const currentStory = currentDealer?.stories[currentStoryIndex]

  useEffect(() => {
    if (!currentStory) return

    const duration = currentStory.duration * 1000
    const interval = 50
    let elapsed = 0

    const timer = setInterval(() => {
      elapsed += interval
      setProgress((elapsed / duration) * 100)

      if (elapsed >= duration) {
        handleNext()
      }
    }, interval)

    return () => clearInterval(timer)
  }, [currentStory, currentStoryIndex, selectedDealer])

  const handleNext = () => {
    if (!currentDealer) return

    if (currentStoryIndex < currentDealer.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
      setProgress(0)
    } else if (selectedDealer !== null && selectedDealer < dealerStories.length - 1) {
      setSelectedDealer(selectedDealer + 1)
      setCurrentStoryIndex(0)
      setProgress(0)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
      setProgress(0)
    } else if (selectedDealer !== null && selectedDealer > 0) {
      setSelectedDealer(selectedDealer - 1)
      const prevDealer = dealerStories[selectedDealer - 1]
      if (prevDealer) {
        setCurrentStoryIndex(prevDealer.stories.length - 1)
        setProgress(0)
      }
    }
  }

  const handleClose = () => {
    setSelectedDealer(null)
    setCurrentStoryIndex(0)
    setProgress(0)
  }

  const openStory = (index: number) => {
    setSelectedDealer(index)
    setCurrentStoryIndex(0)
    setProgress(0)
  }

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
        {dealerStories.map((dealer, index) => (
          <button
            key={dealer.dealerId}
            onClick={() => openStory(index)}
            className="flex-shrink-0 flex flex-col items-center gap-1"
          >
            <div
              className={`w-16 h-16 rounded-full p-0.5 ${
                dealer.viewedAt
                  ? "bg-gray-300"
                  : "bg-gradient-to-tr from-primary via-secondary to-primary"
              }`}
            >
              <div className="w-full h-full rounded-full bg-white p-0.5">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-muted">
                  {dealer.dealerLogo ? (
                    <Image
                      src={dealer.dealerLogo}
                      alt={dealer.dealerName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-primary">
                      {dealer.dealerName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-center max-w-[64px] truncate">
              {dealer.dealerName}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={selectedDealer !== null} onOpenChange={handleClose}>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black border-0">
          <VisuallyHidden>
            <DialogTitle>{currentDealer?.dealerName} Stories</DialogTitle>
          </VisuallyHidden>
          {currentDealer && currentStory && (
            <div className="relative w-full h-full">
              <div className="absolute top-0 left-0 right-0 z-10 p-4 space-y-2">
                <div className="flex gap-1">
                  {currentDealer.stories.map((_, index) => (
                    <div
                      key={index}
                      className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-white transition-all duration-100"
                        style={{
                          width:
                            index === currentStoryIndex
                              ? `${progress}%`
                              : index < currentStoryIndex
                              ? "100%"
                              : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white">
                      {currentDealer.dealerName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-white text-sm font-medium">
                      {currentDealer.dealerName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {currentStory.mediaType === "IMAGE" ? (
                <Image
                  src={currentStory.mediaUrl}
                  alt="Story"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <video
                  src={currentStory.mediaUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              )}

              <button
                onClick={handlePrevious}
                className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                aria-label="Previous story"
              />
              <button
                onClick={handleNext}
                className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                aria-label="Next story"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
