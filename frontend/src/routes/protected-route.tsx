import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/use-auth";
import { Card, Spinner } from "../components/ui";

export function ProtectedRoute(): React.ReactElement {
  const { isReady, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
          <Spinner />
          <div>
            <h1 className="text-lg font-semibold text-brand-text">Loading your portal</h1>
            <p className="mt-2 text-sm text-brand-muted">Verifying your session and restoring your shopping state.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
