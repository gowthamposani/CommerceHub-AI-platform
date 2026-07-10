import { LockKeyhole, Store } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { getApiErrorMessage } from "@/api/errors";
import { FormField } from "@/components/forms/FormField";
import { zodFormResolver } from "@/components/forms/formResolver";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? "/seller/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodFormResolver(loginSchema),
    defaultValues: { email: "", password: "", remember_me: false }
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (apiError) {
      setError(getApiErrorMessage(apiError));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gold text-gray-950">
            <Store className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-950">Sign in</h1>
            <p className="text-sm text-gray-600">Access your CommerceHub workspace.</p>
          </div>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-brand-red">{error}</div>
          ) : null}
          <FormField label="Email" error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register("email")} />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...register("password")} />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Checkbox {...register("remember_me")} />
            Remember me
          </label>
          <Button type="submit" loading={isSubmitting} className="w-full">
            <LockKeyhole className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          New to CommerceHub?{" "}
          <Link
            className="font-semibold text-gray-950 underline decoration-brand-gold decoration-2"
            to="/auth/register"
          >
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
