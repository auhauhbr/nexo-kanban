import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { Aplicacao } from "./Aplicacao";
import { ProvedorAutenticacao } from "./contexto/ContextoAutenticacao";
import "./estilos.css";

const clienteConsultas = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <BrowserRouter>
        <ProvedorAutenticacao>
          <Aplicacao />
        </ProvedorAutenticacao>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
