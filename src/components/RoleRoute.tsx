import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import type { UserRole } from "@/types/auth.types";

interface RoleRouteProps {
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const RoleRoute = ({ allowedRoles, redirectTo = "/" }: RoleRouteProps): React.JSX.Element => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    const fallback =
      user?.role === "CLIENT" ? "/morador/dashboard" : "/operador/dashboard";
    return <Navigate to={redirectTo !== "/" ? redirectTo : fallback} replace />;
  }

  return <Outlet />;
};
