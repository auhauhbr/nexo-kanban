import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorAtualizarEtiqueta,
  controladorCriarEtiqueta,
  controladorDesvincularEtiqueta,
  controladorExcluirEtiqueta,
  controladorVincularEtiqueta
} from "./etiquetas.controlador.js";

export const rotasEtiquetas = Router();

rotasEtiquetas.use(intermediarioDeAutenticacao);
rotasEtiquetas.post("/boards/:boardId/labels", controladorCriarEtiqueta);
rotasEtiquetas.patch("/labels/:id", controladorAtualizarEtiqueta);
rotasEtiquetas.delete("/labels/:id", controladorExcluirEtiqueta);
rotasEtiquetas.post("/cards/:cardId/labels/:labelId", controladorVincularEtiqueta);
rotasEtiquetas.delete("/cards/:cardId/labels/:labelId", controladorDesvincularEtiqueta);
