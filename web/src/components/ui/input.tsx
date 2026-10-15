import { useId, useState, type InputHTMLAttributes } from "react";

import { HugeiconsIcon, ViewIcon, ViewOffSlashIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className, id: idProp, type, ...props }: InputProps) {
  const reactId = useId();
  const id = idProp ?? reactId;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-label={props.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-8 w-full min-w-0 border border-input bg-input/30 px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-0 md:text-sm",
            isPassword && "pr-10",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={revealed ? "Hide password" : "Show password"}
            onClick={() => setRevealed((prev) => !prev)}
            className="absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            {revealed ? <HugeiconsIcon icon={ViewOffSlashIcon} className="size-4" /> : <HugeiconsIcon icon={ViewIcon} className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
