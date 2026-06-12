import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorExcluirLista,
  controladorAtualizarLista
} from "./listas.controlador.js";
import { controladorCriarCartao } from "../cartoes/cartoes.controlador.js";

export const rotasListas = Router();

rotasListas.use(intermediarioDeAutenticacao);
rotasListas.post("/:listId/cards", controladorCriarCartao);
rotasListas.patch("/:id", controladorAtualizarLista);
rotasListas.delete("/:id", controladorExcluirLista);
