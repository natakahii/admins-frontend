import { Navigate } from "react-router-dom";
import { useAuth } from "../app/providers/authContext.js";

export default function RoleRoute({ allow = [], children }) {
  const { adminRole, loading } = useAuth();
  if (loading) return null;

  if (!adminRole) return <Navigate to="/forbidden" replace />;
  if (!allow.includes(adminRole)) return <Navigate to="/forbidden" replace />;
  return children;
}
