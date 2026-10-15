import { redirect } from "@tanstack/react-router";

import type { User } from "@/api/auth/me";
import type { Permission } from "@/api/auth/permissions";

export function requirePermission(permission: Permission) {
  return ({ context }: { context: { user: User } }) => {
    if (!context.user.permissions.includes(permission)) {
      throw redirect({ to: "/admin" });
    }
  };
}
