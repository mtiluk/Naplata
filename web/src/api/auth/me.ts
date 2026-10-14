import { queryOptions } from "@tanstack/react-query";

import type { Permission } from "@/api/auth/permissions";

export type User = {
  id: string;
  email: string;
  given_name: string;
  family_name: string;
  created_at: string;
  permissions: Permission[];
};

export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async (): Promise<User | null> => {
    const res = await fetch("/api/v1/me");
    if (res.status === 401) return null;
    if (!res.ok) throw new Error("Failed to load user");
    return res.json();
  },
  staleTime: 5 * 60 * 1000,
});
