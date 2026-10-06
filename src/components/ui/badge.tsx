import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white text-slate-950 shadow",
        secondary:
          "border-slate-800 bg-slate-800/80 text-slate-300",
        destructive:
          "border-rose-500/30 bg-rose-500/15 text-rose-300 font-medium",
        outline: "text-slate-300 border-slate-800",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-medium",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-300 font-medium",
        purple:
          "border-purple-500/30 bg-purple-500/15 text-purple-300 font-medium",
        blue:
          "border-sky-500/30 bg-sky-500/15 text-sky-300 font-medium",
        cyan:
          "border-cyan-500/30 bg-cyan-500/15 text-cyan-300 font-medium",
        indigo:
          "border-indigo-500/30 bg-indigo-500/15 text-indigo-300 font-medium",
        amber:
          "border-amber-500/30 bg-amber-500/15 text-amber-300 font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
