import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck } from 'lucide-react';

import { AuthLayout } from '../../components/auth-layout';
import { Alert, Button, Field, Input, SectionBadge } from '../../components/ui';
import { useAuth } from '../../auth/use-auth';
import { getApiErrorMessage } from '../../api/error';
import { validateEmail, validatePassword, validateRequired } from '../../utils/validators';
import type { AuthRegistrationPayload } from '../../types/domain';

export function RegisterPage(): React.ReactElement {
  const { register, login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fieldErrors = useMemo(
    () => ({
      firstName: validateRequired(firstName, 'First name'),
      lastName: validateRequired(lastName, 'Last name'),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword:
        confirmPassword && confirmPassword !== password ? 'Passwords do not match' : null,
    }),
    [confirmPassword, email, firstName, lastName, password],
  );

  useEffect(() => {
    if (isReady && isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isReady, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    setSuccess(null);

    const nextError =
      validateRequired(firstName, 'First name') ??
      validateRequired(lastName, 'Last name') ??
      validateEmail(email) ??
      validatePassword(password) ??
      (confirmPassword !== password ? 'Passwords do not match' : null);

    if (nextError) {
      setError(nextError);
      return;
    }

    const payload: AuthRegistrationPayload = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password,
      role: 'customer',
    };

    try {
      setLoading(true);
      await register(payload);
      await login({ email: payload.email, password: payload.password }, true);
      setSuccess('Your customer account is ready. Redirecting to home.');
      navigate('/home', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your customer account"
      description="Register once and return to a persistent shopping experience with order history, address management, and wishlist saving."
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-primaryDark underline-offset-4 hover:underline">
            Login here
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <SectionBadge>Customer sign up</SectionBadge>
          <p className="text-xs font-medium text-brand-muted">Customer portal only</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-brand-text">Register</h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">
            Create a customer profile to shop, save items, and manage delivery addresses.
          </p>
        </div>

        {error ? (
          <Alert tone="danger" title="Registration failed">
            {error}
          </Alert>
        ) : null}
        {success ? (
          <Alert tone="success" title="Account created">
            {success}
          </Alert>
        ) : null}

        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="First name" htmlFor="register-first-name" error={submitted ? fieldErrors.firstName : null} required>
            <Input
              id="register-first-name"
              autoComplete="given-name"
              placeholder="Manasa"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>

          <Field label="Last name" htmlFor="register-last-name" error={submitted ? fieldErrors.lastName : null} required>
            <Input
              id="register-last-name"
              autoComplete="family-name"
              placeholder="Athi"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Email" htmlFor="register-email" error={submitted ? fieldErrors.email : null} required>
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
          </div>

          <Field label="Password" htmlFor="register-password" error={submitted ? fieldErrors.password : null} required>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <Field
            label="Confirm password"
            htmlFor="register-confirm-password"
            error={submitted ? fieldErrors.confirmPassword : null}
            required
          >
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account...' : 'Register customer account'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <div className="rounded-2xl bg-brand-secondary/50 px-4 py-3 text-sm text-brand-muted">
          <div className="flex items-start gap-3">
            <BadgeCheck className="mt-0.5 h-4 w-4 text-brand-primaryDark" />
            <p>
              Passwords must include at least one letter, one number, and be at least 8 characters long.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
