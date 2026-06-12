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

rotasChecklists.use(intermediarioDeAutenticacao);
rotasChecklists.post("/cards/:cardId/checklists", controladorCriarChecklist);
rotasChecklists.delete("/checklists/:id", controladorExcluirChecklist);
rotasChecklists.post("/checklists/:checklistId/items", controladorCriarItemChecklist);
rotasChecklists.patch("/checklist-items/:id", controladorAtualizarItemChecklist);
rotasChecklists.delete("/checklist-items/:id", controladorExcluirItemChecklist);
