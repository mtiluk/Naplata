import type { QueryClient } from "@tanstack/react-query";
import { IconContext } from "@phosphor-icons/react/dist/lib/context";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { ToastProvider } from "@/components/toast/toast-provider";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
  notFoundComponent: () => <p className="px-6 py-8">Page not found.</p>,
});

function RootLayout() {
  return (
    <IconContext value={{ weight: "light" }}>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </IconContext>
  );
}
