import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";
import { z } from "zod";

import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { verifyAuthToken } from "../utils/auth-token.js";

const joinBoardSchema = z.object({
  boardId: z.string().uuid()
});

let io: Server | undefined;

export const boardRoom = (boardId: string) => `board:${boardId}`;

export const emitBoardEvent = (
  boardId: string,
  event: string,
  payload: unknown
) => {
  io?.to(boardRoom(boardId)).emit(event, payload);
  io?.to(boardRoom(boardId)).emit("board:updated", { boardId });
};

export const createSocketServer = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (typeof token !== "string") {
      next(new Error("Authentication token is required"));
      return;
    }

    try {
      socket.data.userId = verifyAuthToken(token);
      next();
    } catch {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-board", async (input, acknowledge) => {
      const parsedInput = joinBoardSchema.safeParse(input);

      if (!parsedInput.success) {
        acknowledge?.({ ok: false, message: "Invalid board id" });
        return;
      }

      const board = await prisma.board.findFirst({
        where: {
          id: parsedInput.data.boardId,
          ownerId: socket.data.userId
        },
        select: { id: true }
      });

      if (!board) {
        acknowledge?.({ ok: false, message: "Board not found" });
        return;
      }

      await socket.join(boardRoom(board.id));
      acknowledge?.({ ok: true });
    });
  });

  return io;
};
