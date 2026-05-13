import { Navigate, Outlet, useLocation } from "react-router-dom";

interface Props {
  role?: string;
}

export default function AdminProtectedRoute({ role }: Props) {
  const token = localStorage.getItem("token"); 
  const userDataString = localStorage.getItem("user_data");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/ayamgoreng/login" replace state={{ from: location }} />;
  }

  if (role && userDataString) {
    const user = JSON.parse(userDataString);
    if (user.role !== role) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}