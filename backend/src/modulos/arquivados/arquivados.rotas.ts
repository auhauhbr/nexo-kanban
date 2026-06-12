import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorListarArquivados,
  controladorRestaurarCartao,
  controladorRestaurarLista
} from "./arquivados.controlador.js";

export const rotasArquivados = Router();
rotasArquivados.use(intermediarioDeAutenticacao);
rotasArquivados.get("/boards/:id/archived", controladorListarArquivados);
rotasArquivados.patch("/lists/:id/restaurar", controladorRestaurarLista);
rotasArquivados.patch("/cards/:id/restaurar", controladorRestaurarCartao);
