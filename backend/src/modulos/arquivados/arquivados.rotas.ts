import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorListarArquivados,
  controladorRestaurarCartao,
  controladorRestaurarLista
} from "./arquivados.controlador.js";

export const rotasArquivados = Router();
rotasArquivados.get(
  "/boards/:id/archived",
  intermediarioDeAutenticacao,
  controladorListarArquivados
);
rotasArquivados.patch(
  "/lists/:id/restaurar",
  intermediarioDeAutenticacao,
  controladorRestaurarLista
);
rotasArquivados.patch(
  "/cards/:id/restaurar",
  intermediarioDeAutenticacao,
  controladorRestaurarCartao
);
