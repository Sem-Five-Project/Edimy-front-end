import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const profileSectionVariants = cva("space-y-4 transition-all duration-200", {
  variants: {
    variant: {
      default: "",
      bordered: "border-b border-border pb-6 last:border-b-0 last:pb-0",
      card: "rounded-lg border border-border bg-card/50 p-4",
      highlight: "rounded-lg bg-accent/30 p-4 border border-accent/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const profileSectionTitleVariants = cva(
  "font-semibold tracking-tight transition-colors",
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg",
      },
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        accent: "text-accent-foreground",
        primary: "text-primary",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

export interface ProfileSectionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof profileSectionVariants> {
  title?: string;
  titleVariant?: VariantProps<typeof profileSectionTitleVariants>["variant"];
  titleSize?: VariantProps<typeof profileSectionTitleVariants>["size"];
}

const ProfileSection = React.forwardRef<HTMLDivElement, ProfileSectionProps>(
  (
    { className, variant, title, titleVariant, titleSize, children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(profileSectionVariants({ variant, className }))}
        {...props}
      >
        {title && (
          <h3
            className={cn(
              profileSectionTitleVariants({
                variant: titleVariant,
                size: titleSize,
              }),
            )}
          >
            {title}
          </h3>
        )}
        {children}
      </div>
    );
  },
);
ProfileSection.displayName = "ProfileSection";

export { ProfileSection, profileSectionVariants, profileSectionTitleVariants };
