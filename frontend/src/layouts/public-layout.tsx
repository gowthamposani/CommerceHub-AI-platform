import { Outlet, Link } from 'react-router-dom';
import { ArrowRight, Sparkles, UserRound, LogIn } from 'lucide-react';

import { appConfig } from '../config';
import { ButtonLink } from '../components/ui';
import { useAuth } from '../auth/use-auth';

export function PublicLayout(): React.ReactElement {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-hero-radial">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-3 text-brand-text">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">{appConfig.appName}</p>
            <p className="mt-1 text-xs text-brand-muted">Customer portal</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <ButtonLink to="/home" variant="primary">.  
              Go to home <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:bg-white/80"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <ButtonLink to="/register">
                <UserRound className="h-4 w-4" />
                Register
              </ButtonLink>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-brand-muted sm:px-6 lg:px-8">
        CommerceHub AI is built for customer shopping journeys with secure JWT-based access.
      </footer>
    </div>
  );
}
