import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorAtualizarItemChecklist,
  controladorCriarChecklist,
  controladorCriarItemChecklist,
  controladorExcluirChecklist,
  controladorExcluirItemChecklist
} from "./checklists.controlador.js";

export const rotasChecklists = Router();

rotasChecklists.post(
  "/cards/:cardId/checklists",
  intermediarioDeAutenticacao,
  controladorCriarChecklist
);
rotasChecklists.delete(
  "/checklists/:id",
  intermediarioDeAutenticacao,
  controladorExcluirChecklist
);
rotasChecklists.post(
  "/checklists/:checklistId/items",
  intermediarioDeAutenticacao,
  controladorCriarItemChecklist
);
rotasChecklists.patch(
  "/checklist-items/:id",
  intermediarioDeAutenticacao,
  controladorAtualizarItemChecklist
);
rotasChecklists.delete(
  "/checklist-items/:id",
  intermediarioDeAutenticacao,
  controladorExcluirItemChecklist
);
