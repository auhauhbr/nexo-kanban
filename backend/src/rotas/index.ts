import { Router } from "express";

import { prisma } from "../configuracao/prisma.js";
import { rotasAutenticacao } from "../modulos/autenticacao/autenticacao.rotas.js";
import { rotasQuadros } from "../modulos/quadros/quadros.rotas.js";
import { rotasCartoes } from "../modulos/cartoes/cartoes.rotas.js";
import { rotasListas } from "../modulos/listas/listas.rotas.js";
import { rotasEtiquetas } from "../modulos/etiquetas/etiquetas.rotas.js";
import { rotasChecklists } from "../modulos/checklists/checklists.rotas.js";
import { rotasInteracoes } from "../modulos/interacoes/interacoes.rotas.js";

export const rotas = Router();

rotas.use("/auth", rotasAutenticacao);
rotas.use("/boards", rotasQuadros);
rotas.use("/cards", rotasCartoes);
rotas.use("/lists", rotasListas);
rotas.use(rotasEtiquetas);
rotas.use(rotasChecklists);
rotas.use(rotasInteracoes);

rotas.get("/health", async (_requisicao, resposta) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    resposta.status(200).json({
      status: "ok",
      service: "kanban-api",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (erro) {
    console.error("A verificação de saúde do banco falhou:", erro);

    resposta.status(503).json({
      status: "error",
      service: "kanban-api",
      database: "disconnected",
      timestamp: new Date().toISOString()
    });
  }
});
