import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { loading, user } = useAuth();

  if (loading) {
    return <div className="app-loading">Carregando...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
