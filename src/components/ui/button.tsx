import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus-visible:ring-blue-500",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-rose-700 focus-visible:ring-red-500",
        outline:
          "border-2 border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-indigo-50 hover:border-purple-300 hover:text-purple-700 shadow-md hover:shadow-lg focus-visible:ring-purple-500",
        secondary:
          "bg-gradient-to-r from-slate-100 to-gray-200 text-slate-700 shadow-md hover:shadow-lg hover:from-slate-200 hover:to-gray-300 focus-visible:ring-slate-500",
        ghost:
          "hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-indigo-50 hover:text-purple-700 rounded-xl",
        link: "text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text underline-offset-4 hover:underline hover:from-blue-700 hover:to-purple-700",
        success:
          "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-green-700 focus-visible:ring-emerald-500",
        warning:
          "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-700 focus-visible:ring-amber-500",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
