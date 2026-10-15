import type { HTMLAttributes, MouseEvent, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { ArrowDown01Icon, ArrowUp01Icon, ArrowUpDownIcon, HugeiconsIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto border border-border">
      <table className={cn("w-full text-[13px]", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-muted/30", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-border transition-colors hover:bg-muted/40", className)} {...props} />;
}

type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement> & {
  sort?: "asc" | "desc" | false;
  onSort?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function TableHead({ className, sort, onSort, children, ...props }: TableHeadProps) {
  return (
    <th
      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
      className={cn("label h-8 px-3 text-left align-middle whitespace-nowrap text-muted-foreground", className)}
      {...props}
    >
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className={cn("inline-flex items-center gap-1 uppercase transition-colors hover:text-foreground", sort && "text-foreground")}
        >
          {children}
          <HugeiconsIcon
            icon={sort === "asc" ? ArrowUp01Icon : sort === "desc" ? ArrowDown01Icon : ArrowUpDownIcon}
            className={cn("size-3", !sort && "opacity-40")}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("h-11 px-3 py-1.5 align-middle whitespace-nowrap", className)} {...props} />;
}
