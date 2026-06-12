import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";
import type { EntradaCriarCartao, EntradaAtualizarCartao } from "./cartoes.esquema.js";

const inclusaoDetalhesCartao = {
  labels: {
    orderBy: {
      createdAt: "asc"
    }
  },
  checklists: {
    orderBy: {
      position: "asc"
    },
    include: {
      items: {
        orderBy: {
          position: "asc"
        }
      }
    }
  },
  attachments: { orderBy: { createdAt: "desc" } },
  activities: {
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { user: { select: { id: true, name: true } } }
  }
} as const;

const buscarListaDoProprietario = async (idProprietario: string, idLista: string) => {
  const lista = await prisma.list.findFirst({
    where: {
      id: idLista,
      board: {
        ownerId: idProprietario
      }
    }
  });

  if (!lista) {
    throw new ErroAplicacao("Lista não encontrada", 404);
  }

  return lista;
};

const buscarCartaoDoProprietario = async (idProprietario: string, idCartao: string) => {
  const cartao = await prisma.card.findFirst({
    where: {
      id: idCartao,
      list: {
        board: {
          ownerId: idProprietario
        }
      }
    },
    include: {
      list: {
        select: {
          boardId: true
        }
      },
      ...inclusaoDetalhesCartao
    }
  });

  if (!cartao) {
    throw new ErroAplicacao("Cartão não encontrado", 404);
  }

  return cartao;
};

export const criarCartao = async (
  idProprietario: string,
  idLista: string,
  entrada: EntradaCriarCartao
) => {
  const lista = await buscarListaDoProprietario(idProprietario, idLista);

  return prisma.$transaction(async (transacao) => {
    const ultimoCartao = await transacao.card.findFirst({
      where: { listId: idLista },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    const cartao = await transacao.card.create({
      data: {
        title: entrada.title,
        description: entrada.description,
        position: (ultimoCartao?.position ?? -1) + 1,
        number: lista.boardId
          ? (
              await transacao.board.update({
                where: { id: lista.boardId },
                data: { nextCardNumber: { increment: 1 } },
                select: { nextCardNumber: true }
              })
            ).nextCardNumber - 1
          : 0,
        listId: idLista
      },
      include: inclusaoDetalhesCartao
    });
    await transacao.activity.create({
      data: {
        cardId: cartao.id,
        userId: idProprietario,
        type: "create",
        message: "criou este cartão"
      }
    });

    await transacao.board.update({
      where: { id: lista.boardId },
      data: { updatedAt: new Date() }
    });

    return {
      card: cartao,
      boardId: lista.boardId
    };
  });
};

export const atualizarCartao = async (
  idProprietario: string,
  idCartao: string,
  entrada: EntradaAtualizarCartao
) => {
  const cartao = await buscarCartaoDoProprietario(idProprietario, idCartao);
  const idListaDestino = entrada.listId ?? cartao.listId;
  const listaDestino =
    idListaDestino === cartao.listId
      ? { id: cartao.listId, boardId: cartao.list.boardId }
      : await buscarListaDoProprietario(idProprietario, idListaDestino);

  if (listaDestino.boardId !== cartao.list.boardId) {
    throw new ErroAplicacao("Os cartões só podem ser movidos entre listas do mesmo quadro", 400);
  }

  return prisma.$transaction(async (transacao) => {
    let posicao = cartao.position;

    if (idListaDestino === cartao.listId) {
      if (entrada.position !== undefined && entrada.position !== cartao.position) {
        const quantidadeCartoes = await transacao.card.count({
          where: { listId: cartao.listId }
        });

        posicao = Math.min(entrada.position, quantidadeCartoes - 1);

        if (posicao < cartao.position) {
          await transacao.card.updateMany({
            where: {
              listId: cartao.listId,
              position: {
                gte: posicao,
                lt: cartao.position
              }
            },
            data: {
              position: {
                increment: 1
              }
            }
          });
        } else if (posicao > cartao.position) {
          await transacao.card.updateMany({
            where: {
              listId: cartao.listId,
              position: {
                gt: cartao.position,
                lte: posicao
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
      const quantidadeDestino = await transacao.card.count({
        where: { listId: idListaDestino }
      });

      posicao = Math.min(entrada.position ?? quantidadeDestino, quantidadeDestino);

      await transacao.card.updateMany({
        where: {
          listId: cartao.listId,
          position: {
            gt: cartao.position
          }
        },
        data: {
          position: {
            decrement: 1
          }
        }
      });

      await transacao.card.updateMany({
        where: {
          listId: idListaDestino,
          position: {
            gte: posicao
          }
        },
        data: {
          position: {
            increment: 1
          }
        }
      });
    }

    const cartaoAtualizado = await transacao.card.update({
      where: { id: idCartao },
      data: {
        title: entrada.title,
        description: entrada.description,
        dueDate: entrada.dueDate,
        coverColor: entrada.coverColor,
        archived: entrada.archived,
        listId: idListaDestino,
        position: posicao
      },
      include: inclusaoDetalhesCartao
    });
    const mudouLista = idListaDestino !== cartao.listId;
    await transacao.activity.create({
      data: {
        cardId: idCartao,
        userId: idProprietario,
        type: mudouLista ? "move" : entrada.archived ? "archive" : "update",
        message: mudouLista
          ? "moveu este cartão para outra lista"
          : entrada.archived
            ? "arquivou este cartão"
            : "atualizou este cartão"
      }
    });

    await transacao.board.update({
      where: { id: cartao.list.boardId },
      data: { updatedAt: new Date() }
    });

    return {
      card: cartaoAtualizado,
      boardId: cartao.list.boardId
    };
  });
};

export const excluirCartao = async (idProprietario: string, idCartao: string) => {
  const cartao = await buscarCartaoDoProprietario(idProprietario, idCartao);

  await prisma.$transaction(async (transacao) => {
    await transacao.card.delete({
      where: { id: idCartao }
    });

    await transacao.card.updateMany({
      where: {
        listId: cartao.listId,
        position: {
          gt: cartao.position
        }
      },
      data: {
        position: {
          decrement: 1
        }
      }
    });

    await transacao.board.update({
      where: { id: cartao.list.boardId },
      data: { updatedAt: new Date() }
    });
  });

  return cartao.list.boardId;
};
