// src/components/ProtectedRoute.jsx
import { useAuthV2 } from "@/features/authentication-v2/use-auth-v2";
import { Navigate } from "react-router-dom";

/**
 * anyRole: legacy role-based gate — kept for routes not yet mapped to a permission.
 * anyPermission: string | string[] — user needs at least one of these permission codes.
 * If both are given, permission is checked first; role is a fallback only if
 * no anyPermission is provided.
 */
const ProtectedRoute = ({ children, anyRole, anyPermission }) => {
  const { user, isLoading, isAuthenticated } = useAuthV2();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (anyPermission) {
    const required = Array.isArray(anyPermission) ? anyPermission : [anyPermission];
    const userPermissions = user?.permissions ?? [];
    const allowed = required.some((code) => userPermissions.includes(code));
    if (!allowed) return <Navigate to="/unauthorized" replace />;
    return children;
  }

  if (anyRole && !anyRole.some((r) => user?.roles?.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;