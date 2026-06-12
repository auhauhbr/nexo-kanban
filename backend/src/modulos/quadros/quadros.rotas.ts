import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorCriarQuadro,
  controladorExcluirQuadro,
  controladorBuscarQuadro,
  controladorListarQuadros,
  controladorAtualizarQuadro
} from "./quadros.controlador.js";
import { controladorCriarLista } from "../listas/listas.controlador.js";

export const rotasQuadros = Router();

rotasQuadros.use(intermediarioDeAutenticacao);
rotasQuadros.get("/", controladorListarQuadros);
rotasQuadros.post("/", controladorCriarQuadro);
rotasQuadros.post("/:boardId/lists", controladorCriarLista);
rotasQuadros.get("/:id", controladorBuscarQuadro);
rotasQuadros.patch("/:id", controladorAtualizarQuadro);
rotasQuadros.delete("/:id", controladorExcluirQuadro);
