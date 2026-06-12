import { Navigate, Route, Routes } from "react-router-dom";

import { RotaProtegida } from "./componentes/RotaProtegida";
import { PaginaPainel } from "./paginas/PaginaPainel";
import { PaginaQuadro } from "./paginas/PaginaQuadro";
import { PaginaEntrar } from "./paginas/PaginaEntrar";
import { PaginaCadastro } from "./paginas/PaginaCadastro";

export function Aplicacao() {
  return (
    <Routes>
      <Route path="/login" element={<PaginaEntrar />} />
      <Route path="/register" element={<PaginaCadastro />} />
      <Route element={<RotaProtegida />}>
        <Route path="/" element={<PaginaPainel />} />
        <Route path="/quadros/:idQuadro" element={<PaginaQuadro />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
