import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ title, footer, children }: AuthLayoutProps) {
  return (
    <div className="absolute inset-x-0 top-0 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <p className="mb-10 text-center text-base font-semibold tracking-tight">Naplata</p>

        <div className="space-y-5">
          <h1 className="text-center text-lg font-medium">{title}</h1>
          {children}
          <p className="text-center text-xs text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}
