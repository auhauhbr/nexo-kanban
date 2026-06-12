import { Navigate, Outlet } from "react-router-dom";

import { usarAutenticacao } from "../contexto/ContextoAutenticacao";

export function RotaProtegida() {
  const { carregando, usuario } = usarAutenticacao();

  if (carregando) {
    return <div className="app-carregando">Carregando...</div>;
  }

  return usuario ? <Outlet /> : <Navigate to="/login" replace />;
}
