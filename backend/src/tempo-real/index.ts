import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";
import { z } from "zod";

import { ambiente } from "../configuracao/ambiente.js";
import { prisma } from "../configuracao/prisma.js";
import { verificarTokenAutenticacao } from "../utilitarios/token-autenticacao.js";

const esquemaEntrarNoQuadro = z.object({
  boardId: z.string().uuid()
});

let servidorTempoReal: Server | undefined;

export const salaDoQuadro = (idQuadro: string) => `board:${idQuadro}`;

export const emitirEventoDoQuadro = (
  idQuadro: string,
  evento: string,
  dados: unknown
) => {
  servidorTempoReal?.to(salaDoQuadro(idQuadro)).emit(evento, dados);
  servidorTempoReal
    ?.to(salaDoQuadro(idQuadro))
    .emit("board:updated", { boardId: idQuadro });
};

export const criarServidorTempoReal = (servidorHttp: HttpServer) => {
  servidorTempoReal = new Server(servidorHttp, {
    cors: {
      origin: ambiente.FRONTEND_URL
    }
  });

  servidorTempoReal.use((socket, proximo) => {
    const token = socket.handshake.auth.token;

    if (typeof token !== "string") {
      proximo(new Error("O token de autenticação é obrigatório"));
      return;
    }

    try {
      socket.data.idUsuario = verificarTokenAutenticacao(token);
      proximo();
    } catch {
      proximo(new Error("Token de autenticação inválido ou expirado"));
    }
  });

  servidorTempoReal.on("connection", (socket) => {
    socket.on("join-board", async (entrada, confirmar) => {
      const entradaValidada = esquemaEntrarNoQuadro.safeParse(entrada);

      if (!entradaValidada.success) {
        confirmar?.({ ok: false, message: "Identificador do quadro inválido" });
        return;
      }

      const quadro = await prisma.board.findFirst({
        where: {
          id: entradaValidada.data.boardId,
          ownerId: socket.data.idUsuario
        },
        select: { id: true }
      });

      if (!quadro) {
        confirmar?.({ ok: false, message: "Quadro não encontrado" });
        return;
      }

      await socket.join(salaDoQuadro(quadro.id));
      confirmar?.({ ok: true });
    });
  });

  return servidorTempoReal;
};
