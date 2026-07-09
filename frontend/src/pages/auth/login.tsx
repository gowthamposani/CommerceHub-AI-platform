import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

import { AuthLayout } from '../../components/auth-layout';
import { Alert, Button, Field, Input, SectionBadge } from '../../components/ui';
import { useAuth } from '../../auth/use-auth';
import { getApiErrorMessage } from '../../api/error';
import { validateEmail, validatePassword } from '../../utils/validators';

interface LoginLocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage(): React.ReactElement {
  const { login, isAuthenticated, isReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LoginLocationState | null;
  const redirectTo = state?.from?.pathname ?? '/home';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fieldErrors = useMemo(
    () => ({
      email: validateEmail(email),
      password: validatePassword(password),
    }),
    [email, password],
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

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setError(emailError ?? passwordError);
      return;
    }

    try {
      setLoading(true);
      await login({ email, password }, rememberMe);
      setSuccess('Welcome back. Redirecting to your customer dashboard.');
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back to your customer workspace"
      description="Sign in to continue browsing products, managing your wishlist, editing your profile, and placing orders without losing your session."
      footer={
        <p>
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-primaryDark underline-offset-4 hover:underline">
            Create your customer account
          </Link>
        </p>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <SectionBadge>Secure sign in</SectionBadge>
          <p className="text-xs font-medium text-brand-muted">JWT access enabled</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-brand-text">Login</h2>
          <p className="mt-2 text-sm leading-6 text-brand-muted">Use the email address and password you registered with.</p>
        </div>

        {error ? (
          <Alert tone="danger" title="Sign in failed">
            {error}
          </Alert>
        ) : null}
        {success ? (
          <Alert tone="success" title="Signed in">
            {success}
          </Alert>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Email" htmlFor="login-email" error={submitted ? fieldErrors.email : null} required>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>

          <Field label="Password" htmlFor="login-password" error={submitted ? fieldErrors.password : null} required>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-secondary/40 px-4 py-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span className="font-medium text-brand-text">Remember me on this device</span>
          </label>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing you in...' : 'Login'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="rounded-2xl bg-brand-secondary/50 px-4 py-3 text-sm text-brand-muted">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-primaryDark" />
            <p>
              Protected routes keep customers in the portal until their access token expires, then the app refreshes the session automatically.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
