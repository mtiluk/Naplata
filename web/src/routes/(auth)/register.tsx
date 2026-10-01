import { useMutation } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import * as z from "zod";

import { registerUser } from "@/api/auth/user";
import { parseServerError } from "@/api/errors";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
  StatefulButton,
  type ButtonState,
} from "@/components/motion/button/stateful";
import { Checkbox } from "@/components/motion/checkbox";
import { Input } from "@/components/motion/input";

export const Route = createFileRoute("/(auth)/register")({
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
      setTimeout(() => navigate({ to: "/login" }), 800);
    },
  });

  const buttonState: ButtonState = register.isPending
    ? "loading"
    : register.isSuccess
      ? "success"
      : register.isError
        ? "error"
        : "idle";

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
      prompt={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <AuthCard title="Create your account" description="Sign up to start using Naplate!">
        <form className="flex flex-col gap-2 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <Input
              label="Given Name"
              className="flex-1"
              type="text"
              value={form.given_name}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, given_name: value }))
              }
              error={errors.given_name}
              reserveErrorLine
            />

            <Input
              label="Family Name"
              className="flex-1"
              type="text"
              value={form.family_name}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, family_name: value }))
              }
              error={errors.family_name}
              reserveErrorLine
            />
          </div>

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

          <Input
            label="Confirm Password"
            type="password"
            value={form.confirm_password}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, confirm_password: value }))
            }
            error={errors.confirm_password}
            reserveErrorLine
          />

          <Checkbox
            className="mb-5.5 flex"
            label={
              <>
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
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

          <StatefulButton type="submit" className="w-full" successText="Registered!" errorText="Try again" state={buttonState}>
            Register
          </StatefulButton>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
