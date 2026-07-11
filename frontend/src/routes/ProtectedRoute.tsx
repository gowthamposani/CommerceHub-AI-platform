import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/auth";

export function ProtectedRoute({ allowedRoles, children }: { allowedRoles?: UserRole[]; children: ReactNode }) {
  const { isAuthenticated, session } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && session && !allowedRoles.includes(session.user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
