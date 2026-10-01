import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import { meQuery } from "@/api/auth/me";
import { loginUser } from "@/api/auth/user";
import { parseServerError } from "@/api/errors";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { StatefulButton, type ButtonState } from "@/components/motion/button/stateful";
import { Input } from "@/components/motion/input";

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: Login,
});

const loginSchema = z
  .object({
    email: z.email("Enter a valid email").max(254),
    password: z.string().min(8, "Password must be at least 8 characters"),
  });

function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { redirect } = Route.useSearch();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const login = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });

      if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
        navigate({ href: redirect });
      } else {
        navigate({ to: "/client" });
      }
    },
  });

  const buttonState: ButtonState = login.isPending
    ? "loading"
    : login.isSuccess
      ? "success"
      : login.isError
        ? "error"
        : "idle";

  const { fieldErrors: serverFieldErrors, formError } = parseServerError(
    login.error,
    {
      409: { email: "An account with this email already exists" },
    },
  );

  const errors = { ...serverFieldErrors, ...clientErrors };

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = loginSchema.safeParse(form);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setClientErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([field, messages]) => [
            field,
            messages?.[0] ?? "",
          ]),
        ),
      );
      return;
    }

    setClientErrors({});

    const { email, password } = result.data;
    login.mutate({ email, password });
  }

  return (
    <AuthLayout
      prompt={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <AuthCard title="Sign in to Naplata" description="Sign in to start using Naplata!">
        <form className="flex flex-col gap-2 p-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
            error={errors.email}
            reserveErrorLine
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, password: value }))
            }
            error={errors.password}
            reserveErrorLine
          />

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <StatefulButton type="submit" className="w-full" successText="Signing in..." errorText="Try again" state={buttonState}>
            Sign In
          </StatefulButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
