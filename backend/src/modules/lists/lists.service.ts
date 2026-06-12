import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { CreateListInput, UpdateListInput } from "./lists.schema.js";

const getOwnedList = async (ownerId: string, listId: string) => {
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
      board: {
        ownerId
      }
    }
  });

  if (!list) {
    throw new AppError("List not found", 404);
  }

  return list;
};

export const createList = async (
  ownerId: string,
  boardId: string,
  input: CreateListInput
) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId
    },
    select: {
      id: true
    }
  });

  if (!board) {
    throw new AppError("Board not found", 404);
  }

  return prisma.$transaction(async (transaction) => {
    const lastList = await transaction.list.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    const list = await transaction.list.create({
      data: {
        title: input.title,
        position: (lastList?.position ?? -1) + 1,
        boardId
      },
      include: {
        cards: true
      }
    });

    await transaction.board.update({
      where: { id: boardId },
      data: { updatedAt: new Date() }
    });

    return list;
  });
};

export const updateList = async (
  ownerId: string,
  listId: string,
  input: UpdateListInput
) => {
  const list = await getOwnedList(ownerId, listId);

  return prisma.$transaction(async (transaction) => {
    let position = list.position;

    if (input.position !== undefined && input.position !== list.position) {
      const listCount = await transaction.list.count({
        where: { boardId: list.boardId }
      });

      position = Math.min(input.position, listCount - 1);

      if (position < list.position) {
        await transaction.list.updateMany({
          where: {
            boardId: list.boardId,
            position: {
              gte: position,
              lt: list.position
            }
          },
          data: {
            position: {
              increment: 1
            }
          }
        });
      } else if (position > list.position) {
        await transaction.list.updateMany({
          where: {
            boardId: list.boardId,
            position: {
              gt: list.position,
              lte: position
            }
          },
          data: {
            position: {
              decrement: 1
            }
          }
        });
      }
    }

    const updatedList = await transaction.list.update({
      where: { id: listId },
      data: {
        title: input.title,
        position
      },
      include: {
        cards: {
          orderBy: {
            position: "asc"
          }
        }
      }
    });

    await transaction.board.update({
      where: { id: list.boardId },
      data: { updatedAt: new Date() }
    });

    return updatedList;
  });
};

export const deleteList = async (ownerId: string, listId: string) => {
  const list = await getOwnedList(ownerId, listId);

  await prisma.$transaction(async (transaction) => {
    await transaction.list.delete({
      where: { id: listId }
    });

    await transaction.list.updateMany({
      where: {
        boardId: list.boardId,
        position: {
          gt: list.position
        }
      },
      data: {
        position: {
          decrement: 1
        }
      }
    });

    await transaction.board.update({
      where: { id: list.boardId },
      data: { updatedAt: new Date() }
    });
  });

  return list.boardId;
};
