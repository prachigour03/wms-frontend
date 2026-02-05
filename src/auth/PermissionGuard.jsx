import { useAuth } from "./AuthContext";

const PermissionGuard = ({
  permission,
  module,
  action,
  fallback = null,
  children,
}) => {
  const { hasPermission, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return fallback;

  const allowed = permission
    ? hasPermission(permission)
    : hasPermission(module, action);

  return allowed ? children : fallback;
};

export default PermissionGuard;
