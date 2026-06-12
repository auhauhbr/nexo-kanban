import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type {
  CreateBoardInput,
  UpdateBoardInput
} from "./boards.schema.js";

const boardDetailsInclude = {
  lists: {
    orderBy: {
      position: "asc"
    },
    include: {
      cards: {
        orderBy: {
          position: "asc"
        }
      }
    }
  }
} as const;

export const listBoards = (ownerId: string) =>
  prisma.board.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          lists: true
        }
      }
    }
  });

export const createBoard = (ownerId: string, input: CreateBoardInput) =>
  prisma.board.create({
    data: {
      title: input.title,
      ownerId
    },
    include: boardDetailsInclude
  });

export const getBoard = async (ownerId: string, boardId: string) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId
    },
    include: boardDetailsInclude
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  return board;
};

export const updateBoard = async (
  ownerId: string,
  boardId: string,
  input: UpdateBoardInput
) => {
  await getBoard(ownerId, boardId);

  return prisma.board.update({
    where: { id: boardId },
    data: { title: input.title },
    include: boardDetailsInclude
  });
};

export const deleteBoard = async (ownerId: string, boardId: string) => {
  await getBoard(ownerId, boardId);
  await prisma.board.delete({
    where: { id: boardId }
  });
};
