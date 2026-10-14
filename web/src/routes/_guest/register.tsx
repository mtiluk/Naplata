import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import { registerUser } from "@/api/auth/user";
import { parseServerError } from "@/api/errors";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useToast } from "@/components/toast/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_guest/register")({
  component: Register,
});

const registerSchema = z
  .object({
    email: z.email("Enter a valid email").max(254),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
    given_name: z.string().trim().min(1, "Given name is required").max(100),
    family_name: z.string().trim().max(100),
    terms: z.literal(true, {
      error: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm_password: "",
    given_name: "",
    family_name: "",
    terms: false,
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const register = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      showToast({ status: "success", title: "Account created", description: "You can now sign in." });
      navigate({ to: "/login" });
    },
  });

  const { fieldErrors: serverFieldErrors, formError } = parseServerError(
    register.error,
    {
      409: { email: "An account with this email already exists" },
    },
  );

  const errors = { ...serverFieldErrors, ...clientErrors };

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = registerSchema.safeParse(form);

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

    const { email, password, given_name, family_name } = result.data;
    register.mutate({ email, password, given_name, family_name });
  }

  return (
    <AuthLayout
      title="Create account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-accent underline underline-offset-2 hover:text-foreground">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <Input
            className="flex-1"
            type="text"
            placeholder="Given name"
            value={form.given_name}
            onChange={(e) => setForm((prev) => ({ ...prev, given_name: e.target.value }))}
            error={errors.given_name}
          />

          <Input
            className="flex-1"
            type="text"
            placeholder="Family name"
            value={form.family_name}
            onChange={(e) => setForm((prev) => ({ ...prev, family_name: e.target.value }))}
            error={errors.family_name}
          />
        </div>

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

        <Input
          type="password"
          placeholder="Confirm password"
          value={form.confirm_password}
          onChange={(e) => setForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
          error={errors.confirm_password}
        />

        <Checkbox
          label={
            <>
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline underline-offset-2 hover:text-foreground"
              >
                terms and conditions
              </a>
            </>
          }
          checked={form.terms}
          error={!!errors.terms}
          onCheckedChange={(checked) => {
            setForm((prev) => ({ ...prev, terms: checked }));
            if (checked) setClientErrors((prev) => ({ ...prev, terms: "" }));
          }}
        />

        {formError && <p className="text-xs text-destructive">{formError}</p>}

        <Button type="submit" className="w-full" disabled={register.isPending || register.isSuccess}>
          {register.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
