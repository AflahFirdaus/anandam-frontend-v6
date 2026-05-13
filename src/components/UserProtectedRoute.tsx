import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function UserProtectedRoute() {
  const token = localStorage.getItem("user_token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}