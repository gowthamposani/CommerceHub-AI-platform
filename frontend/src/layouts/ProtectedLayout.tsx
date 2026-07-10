import { Outlet } from "react-router-dom";

import { ProtectedRoute } from "@/routes/ProtectedRoute";

export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
