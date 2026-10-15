import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-8 items-center justify-center gap-1.5 border border-transparent bg-primary px-2.5 text-xs font-medium whitespace-nowrap text-primary-foreground transition-colors outline-none select-none hover:bg-primary/80 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
