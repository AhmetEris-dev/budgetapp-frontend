import { Navigate, Outlet, useLocation } from "react-router-dom";
import { storage } from "../utils/storage";

export function ProtectedRoute() {
  const location = useLocation();
  const token = storage.getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
