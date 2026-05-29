/* eslint-disable react-refresh/only-export-components */
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md border",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 dark:bg-white/10 text-white border-white/20 shadow-lg hover:bg-white/20 hover:border-white/30 hover:shadow-xl",
        destructive:
          "bg-red-500/20 dark:bg-red-500/20 text-red-100 border-red-400/30 shadow-lg hover:bg-red-500/30 hover:border-red-400/40",
        outline:
          "bg-white/10 dark:bg-white/10 text-white border-white/20 shadow-lg hover:bg-white/20 hover:border-white/30",
        secondary:
          "bg-white/5 dark:bg-white/5 text-white border-white/10 shadow-md hover:bg-white/15 hover:border-white/20",
        ghost:
          "bg-transparent border-transparent text-white hover:bg-white/10 hover:border-white/10",
        link: "bg-transparent border-transparent text-indigo-300 underline-offset-4 hover:underline hover:text-indigo-200",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
