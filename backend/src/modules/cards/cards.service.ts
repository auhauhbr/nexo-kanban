import { prisma } from "../../config/prisma.js";
import { AppError } from "../../utils/app-error.js";
import type { CreateCardInput, UpdateCardInput } from "./cards.schema.js";

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

const getOwnedCard = async (ownerId: string, cardId: string) => {
  const card = await prisma.card.findFirst({
    where: {
      id: cardId,
      list: {
        board: {
          ownerId
        }
      }
    },
    include: {
      list: {
        select: {
          boardId: true
        }
      }
    }
  });

  if (!card) {
    throw new AppError("Card not found", 404);
  }

  return card;
};

export const createCard = async (
  ownerId: string,
  listId: string,
  input: CreateCardInput
) => {
  const list = await getOwnedList(ownerId, listId);

  return prisma.$transaction(async (transaction) => {
    const lastCard = await transaction.card.findFirst({
      where: { listId },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    const card = await transaction.card.create({
      data: {
        title: input.title,
        description: input.description,
        position: (lastCard?.position ?? -1) + 1,
        listId
      }
    });

    await transaction.board.update({
      where: { id: list.boardId },
      data: { updatedAt: new Date() }
    });

    return card;
  });
};

export const updateCard = async (
  ownerId: string,
  cardId: string,
  input: UpdateCardInput
) => {
  const card = await getOwnedCard(ownerId, cardId);
  const targetListId = input.listId ?? card.listId;
  const targetList =
    targetListId === card.listId
      ? { id: card.listId, boardId: card.list.boardId }
      : await getOwnedList(ownerId, targetListId);

  if (targetList.boardId !== card.list.boardId) {
    throw new AppError("Cards can only move between lists on the same board", 400);
  }

  return prisma.$transaction(async (transaction) => {
    let position = card.position;

    if (targetListId === card.listId) {
      if (input.position !== undefined && input.position !== card.position) {
        const cardCount = await transaction.card.count({
          where: { listId: card.listId }
        });

        position = Math.min(input.position, cardCount - 1);

        if (position < card.position) {
          await transaction.card.updateMany({
            where: {
              listId: card.listId,
              position: {
                gte: position,
                lt: card.position
              }
            },
            data: {
              position: {
                increment: 1
              }
            }
          });
        } else if (position > card.position) {
          await transaction.card.updateMany({
            where: {
              listId: card.listId,
              position: {
                gt: card.position,
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
    } else {
      const targetCount = await transaction.card.count({
        where: { listId: targetListId }
      });

      position = Math.min(input.position ?? targetCount, targetCount);

      await transaction.card.updateMany({
        where: {
          listId: card.listId,
          position: {
            gt: card.position
          }
        },
        data: {
          position: {
            decrement: 1
          }
        }
      });

      await transaction.card.updateMany({
        where: {
          listId: targetListId,
          position: {
            gte: position
          }
        },
        data: {
          position: {
            increment: 1
          }
        }
      });
    }

    const updatedCard = await transaction.card.update({
      where: { id: cardId },
      data: {
        title: input.title,
        description: input.description,
        listId: targetListId,
        position
      }
    });

    await transaction.board.update({
      where: { id: card.list.boardId },
      data: { updatedAt: new Date() }
    });

    return updatedCard;
  });
};

export const deleteCard = async (ownerId: string, cardId: string) => {
  const card = await getOwnedCard(ownerId, cardId);

  await prisma.$transaction(async (transaction) => {
    await transaction.card.delete({
      where: { id: cardId }
    });

    await transaction.card.updateMany({
      where: {
        listId: card.listId,
        position: {
          gt: card.position
        }
      },
      data: {
        position: {
          decrement: 1
        }
      }
    });

    await transaction.board.update({
      where: { id: card.list.boardId },
      data: { updatedAt: new Date() }
    });
  });
};
