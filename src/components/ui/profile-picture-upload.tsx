"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"

interface ProfilePictureUploadProps {
  currentImage?: string
  username: string
  onImageChange: (file: File | null) => void
  isEditing: boolean
}

export function ProfilePictureUpload({ currentImage, username, onImageChange, isEditing }: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onImageChange(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="w-32 h-32 border-4 border-border">
          <AvatarImage src={previewUrl || undefined} alt={username} />
          <AvatarFallback className="text-2xl font-semibold">{getInitials(username)}</AvatarFallback>
        </Avatar>

        {isEditing && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0"
            onClick={handleUploadClick}
          >
            <Camera className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">{username}</h2>
      </div>

      {isEditing && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="flex items-center gap-2 bg-transparent"
        >
          <Upload className="w-4 h-4" />
          Upload New Photo
        </Button>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
    </div>
  )
}
