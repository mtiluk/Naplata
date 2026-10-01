import type { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { ToastProvider } from "@/components/toast/toast-provider";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: () => <p>Page not found.</p>,
});

function RootLayout() {
  return (
    <ToastProvider>
      <main className="px-6 py-8">
        <Outlet />
      </main>
    </ToastProvider>
  );
}
