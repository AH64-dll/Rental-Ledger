import { Navigate, Outlet, useLocation } from "react-router-dom";

export function AuthGuard() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    const redirect = location.pathname !== "/login" ? `?redirect=${encodeURIComponent(location.pathname)}` : "";
    return <Navigate to={`/login${redirect}`} replace />;
  }

  return <Outlet />;
}
