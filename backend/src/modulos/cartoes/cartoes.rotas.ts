import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorExcluirCartao,
  controladorAtualizarCartao
} from "./cartoes.controlador.js";

export const rotasCartoes = Router();

rotasCartoes.use(intermediarioDeAutenticacao);
rotasCartoes.patch("/:id", controladorAtualizarCartao);
rotasCartoes.delete("/:id", controladorExcluirCartao);
