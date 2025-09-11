import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const profileCardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border hover:shadow-md",
        elevated: "border-border shadow-lg hover:shadow-xl",
        gradient: "border-0 bg-gradient-to-br from-card via-card to-muted/20 shadow-lg hover:shadow-xl",
        glass: "border-border/50 bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  },
)

export interface ProfileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof profileCardVariants> {}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return <div ref={ref} className={cn(profileCardVariants({ variant, padding, className }))} {...props} />
  },
)
ProfileCard.displayName = "ProfileCard"

export { ProfileCard, profileCardVariants }
