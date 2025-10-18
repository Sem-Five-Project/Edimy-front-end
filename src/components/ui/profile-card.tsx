import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const profileCardVariants = cva(
  "rounded-2xl border-0 bg-card text-card-foreground shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.01]",
  {
    variants: {
      variant: {
        default: "bg-white/90 backdrop-blur-lg shadow-xl hover:shadow-2xl",
        elevated: "bg-white/95 backdrop-blur-xl shadow-2xl hover:shadow-3xl",
        gradient:
          "bg-gradient-to-br from-white/95 via-blue-50/80 to-purple-50/90 shadow-2xl hover:shadow-3xl backdrop-blur-lg",
        glass:
          "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-3xl",
        premium:
          "bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-purple-50/90 backdrop-blur-xl shadow-2xl hover:shadow-3xl border border-blue-200/50",
      },
      padding: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
        xl: "p-10",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  },
);

export interface ProfileCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof profileCardVariants> {}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(profileCardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  },
);
ProfileCard.displayName = "ProfileCard";

export { ProfileCard, profileCardVariants };
