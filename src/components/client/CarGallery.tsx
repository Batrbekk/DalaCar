"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface MediaItem {
  id: string
  url: string
  type: "IMAGE" | "VIDEO"
  isPrimary: boolean
}

interface CarGalleryProps {
  media: MediaItem[]
  carName: string
}

export function CarGallery({ media, carName }: CarGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  if (media.length === 0) {
    return (
      <div className="relative w-full h-64 bg-muted rounded-lg flex items-center justify-center">
        <Image
          src="/placeholder-car.svg"
          alt={carName}
          width={200}
          height={200}
        />
      </div>
    )
  }

  const currentMedia = media[selectedIndex]

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const minSwipeDistance = 50

    if (Math.abs(distance) < minSwipeDistance) return

    if (distance > 0) {
      // Swiped left - go to next
      handleNext()
    } else {
      // Swiped right - go to previous
      handlePrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="relative w-full h-64 bg-muted rounded-lg overflow-hidden cursor-pointer"
          onClick={() => setIsOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentMedia?.type === "IMAGE" ? (
            <Image
              src={currentMedia.url}
              alt={`${carName} - фото ${selectedIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          ) : currentMedia?.type === "VIDEO" ? (
            <video
              src={currentMedia.url}
              className="w-full h-full object-cover"
              controls
            />
          ) : null}

          {media.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {selectedIndex + 1} / {media.length}
            </div>
          )}
        </div>

        {media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {media.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {item.type === "IMAGE" ? (
                  <Image
                    src={item.url}
                    alt={`${carName} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                    VIDEO
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div
            className="relative w-full h-[80vh]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentMedia?.type === "IMAGE" ? (
              <Image
                src={currentMedia.url}
                alt={`${carName} - фото ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
            ) : currentMedia?.type === "VIDEO" ? (
              <video
                src={currentMedia.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : null}

            {media.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded">
                {selectedIndex + 1} / {media.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
