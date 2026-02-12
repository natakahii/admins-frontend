import { Navigate } from "react-router-dom";
import { useAuth } from "../app/providers/authContext.js";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
