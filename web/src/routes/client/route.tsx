import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { meQuery } from "@/api/auth/me";

export const Route = createFileRoute("/client")({
  beforeLoad: async ({ context, location }) => {
    const user = await context.queryClient.query(meQuery);
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { user };
  },
  component: () => <Outlet />,
});
