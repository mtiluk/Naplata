import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import { meQuery } from "@/api/auth/me";
import { loginUser } from "@/api/auth/user";
import { parseServerError } from "@/api/errors";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_guest/login")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: Login,
});

const loginSchema = z
  .object({
    email: z.email("Enter a valid email").max(254),
    password: z.string().min(1, "Password is required"),
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

  const { fieldErrors: serverFieldErrors, formError } = parseServerError(
    login.error,
    {
      401: "Invalid email or password",
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
      title="Sign in"
      footer={
        <>
          No account?{" "}
          <Link to="/register" className="text-accent underline underline-offset-2 hover:text-foreground">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          error={errors.email}
        />

        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          error={errors.password}
        />

        {formError && <p className="text-xs text-destructive">{formError}</p>}

        <Button type="submit" className="w-full" disabled={login.isPending || login.isSuccess}>
          {login.isPending ? "Signing in..." : "Sign in"}
        </Button>

        <div className="flex justify-center">
          <a href="/forgot-password" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
            Forgot password?
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}
