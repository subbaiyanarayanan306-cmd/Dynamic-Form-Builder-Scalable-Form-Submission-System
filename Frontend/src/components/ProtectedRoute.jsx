import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const authenticated = useSelector(s => s.auth.isAuthenticated);
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
