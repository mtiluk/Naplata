import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { meQuery } from "@/api/auth/me";

export const Route = createFileRoute("/_guest")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.query(meQuery);
    if (user) {
      throw redirect({ to: "/client" });
    }
  },
  component: () => <Outlet />,
});
