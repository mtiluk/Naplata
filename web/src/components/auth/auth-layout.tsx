import type { ReactNode } from "react";

type AuthLayoutProps = {
  prompt: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ prompt, children }: AuthLayoutProps) {
  return (
    <div className="absolute inset-x-0 top-0 min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden flex-col justify-end border-r border-line p-12 lg:flex">
        <h1 className="text-3xl font-medium tracking-tight">Naplata</h1>
        <h3 className="mt-2 text-base text-muted-foreground">
          Invoicing and payments, without the busywork.
        </h3>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <p className="absolute top-6 right-6 text-sm text-muted-foreground">{prompt}</p>
        {children}
      </div>
    </div>
  );
}
