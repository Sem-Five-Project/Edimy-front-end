"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { User, Camera } from "lucide-react"

const profileAvatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-muted transition-all duration-200",
  {
    variants: {
      size: {
        sm: "h-12 w-12",
        default: "h-20 w-20",
        lg: "h-32 w-32",
        xl: "h-40 w-40",
      },
      variant: {
        default: "border-2 border-border",
        ring: "border-4 border-background shadow-lg ring-2 ring-ring/20",
        gradient: "border-0 ring-4 ring-gradient-to-r from-primary/30 via-accent/30 to-secondary/30",
        glow: "border-2 border-primary/20 shadow-lg shadow-primary/10",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
)

const profileAvatarImageVariants = cva("h-full w-full object-cover transition-all duration-200", {
  variants: {
    hover: {
      none: "",
      scale: "hover:scale-105",
      brightness: "hover:brightness-110",
    },
  },
  defaultVariants: {
    hover: "scale",
  },
})

export interface ProfileAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof profileAvatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  editable?: boolean
  onEdit?: () => void
  imageHover?: VariantProps<typeof profileAvatarImageVariants>["hover"]
}

const ProfileAvatar = React.forwardRef<HTMLDivElement, ProfileAvatarProps>(
  ({ className, size, variant, src, alt, fallback, editable, onEdit, imageHover, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(profileAvatarVariants({ size, variant, className }))} {...props}>
        {src ? (
          <img
            src={src || "/placeholder.svg"}
            alt={alt || "Profile"}
            className={cn(profileAvatarImageVariants({ hover: imageHover }))}
          />
        ) : (
          <User className="h-1/2 w-1/2 text-muted-foreground" />
        )}

        {editable && (
          <button
            onClick={onEdit}
            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100 rounded-full"
          >
            <Camera className="h-1/3 w-1/3 text-white" />
          </button>
        )}
      </div>
    )
  },
)
ProfileAvatar.displayName = "ProfileAvatar"

export { ProfileAvatar, profileAvatarVariants }
