import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/errors";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  role: z.literal("seller"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodFormResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "seller",
      password: ""
    }
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    try {
      await registerUser(values);
      navigate("/seller/dashboard", { replace: true });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-950">Create account</h1>
          <p className="text-sm text-gray-600">Register a secure CommerceHub user account.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</div> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" error={errors.first_name?.message}>
              <Input autoComplete="given-name" {...register("first_name")} />
            </FormField>
            <FormField label="Last name" error={errors.last_name?.message}>
              <Input autoComplete="family-name" {...register("last_name")} />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" error={errors.email?.message}>
              <Input type="email" autoComplete="email" {...register("email")} />
            </FormField>
            <FormField label="Phone" error={errors.phone?.message}>
              <Input autoComplete="tel" {...register("phone")} />
            </FormField>
          </div>
          <input type="hidden" {...register("role")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-gray-700">
              Seller workspace account
            </div>
            <FormField label="Password" error={errors.password?.message}>
              <Input type="password" autoComplete="new-password" {...register("password")} />
            </FormField>
          </div>
          <Button type="submit" loading={isSubmitting}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link className="font-semibold text-gray-950 underline decoration-brand-gold decoration-2" to="/auth/login">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
