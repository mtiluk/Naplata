import type { ReactNode } from "react";
import { Check } from "lucide-react";

type CheckboxProps = {
  label: ReactNode;
  checked: boolean;
  error?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Checkbox({ label, checked, error, onCheckedChange }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
      <span className="relative grid size-4 shrink-0 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          aria-invalid={error || undefined}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer size-4 cursor-pointer appearance-none border border-input bg-input/30 transition-colors outline-none checked:border-primary checked:bg-primary focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-0"
        />
        <Check className="pointer-events-none absolute hidden size-3 text-primary-foreground peer-checked:block" strokeWidth={3} />
      </span>
      <span>{label}</span>
    </label>
  );
}
