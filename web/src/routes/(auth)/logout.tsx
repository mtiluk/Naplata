import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { meQuery } from "@/api/auth/me";
import { useToast } from "@/components/toast/use-toast";

export const Route = createFileRoute("/(auth)/logout")({
  component: Logout,
});

function Logout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/v1/auth/logout", { method: "POST" }).then(() => {
      if (cancelled) return;
      queryClient.setQueryData(meQuery.queryKey, null);
      showToast({ status: "success", title: "Logged out", description: "You have been logged out." });
      navigate({ to: "/login" });
    });

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient, showToast]);

  return null;
}
