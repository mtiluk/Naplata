import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-lg bg-panel shadow-md">
      <div className="border-b border-line bg-panel-raised px-5 py-3.5">
        <h2 className="font-medium">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>

      {children}
    </div>
  );
}
