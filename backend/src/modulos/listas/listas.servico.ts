import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";
import type { EntradaCriarLista, EntradaAtualizarLista } from "./listas.esquema.js";

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

export const criarLista = async (
  idProprietario: string,
  idQuadro: string,
  entrada: EntradaCriarLista
) => {
  const quadro = await prisma.board.findFirst({
    where: {
      id: idQuadro,
      ownerId: idProprietario
    },
    select: {
      id: true
    }
  });

  if (!quadro) {
    throw new ErroAplicacao("Quadro não encontrado", 404);
  }

  return prisma.$transaction(async (transacao) => {
    const ultimaLista = await transacao.list.findFirst({
      where: { boardId: idQuadro },
      orderBy: { position: "desc" },
      select: { position: true }
    });

    const lista = await transacao.list.create({
      data: {
        title: entrada.title,
        position: (ultimaLista?.position ?? -1) + 1,
        boardId: idQuadro
      },
      include: {
        cards: true
      }
    });

    await transacao.board.update({
      where: { id: idQuadro },
      data: { updatedAt: new Date() }
    });

    return lista;
  });
};

export const atualizarLista = async (
  idProprietario: string,
  idLista: string,
  entrada: EntradaAtualizarLista
) => {
  const lista = await buscarListaDoProprietario(idProprietario, idLista);

  return prisma.$transaction(async (transacao) => {
    let posicao = lista.position;

    if (entrada.position !== undefined && entrada.position !== lista.position) {
      const quantidadeListas = await transacao.list.count({
        where: { boardId: lista.boardId }
      });

      posicao = Math.min(entrada.position, quantidadeListas - 1);

      if (posicao < lista.position) {
        await transacao.list.updateMany({
          where: {
            boardId: lista.boardId,
            position: {
              gte: posicao,
              lt: lista.position
            }
          },
          data: {
            position: {
              increment: 1
            }
          }
        });
      } else if (posicao > lista.position) {
        await transacao.list.updateMany({
          where: {
            boardId: lista.boardId,
            position: {
              gt: lista.position,
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

    const listaAtualizada = await transacao.list.update({
      where: { id: idLista },
      data: {
        title: entrada.title,
        position: posicao,
        archived: entrada.archived,
        wipLimit: entrada.wipLimit
      },
      include: {
        cards: {
          orderBy: {
            position: "asc"
          }
        }
      }
    });

    await transacao.board.update({
      where: { id: lista.boardId },
      data: { updatedAt: new Date() }
    });

    return listaAtualizada;
  });
};

export const excluirLista = async (idProprietario: string, idLista: string) => {
  const lista = await buscarListaDoProprietario(idProprietario, idLista);

  await prisma.$transaction(async (transacao) => {
    await transacao.list.delete({
      where: { id: idLista }
    });

    await transacao.list.updateMany({
      where: {
        boardId: lista.boardId,
        position: {
          gt: lista.position
        }
      },
      data: {
        position: {
          decrement: 1
        }
      }
    });

    await transacao.board.update({
      where: { id: lista.boardId },
      data: { updatedAt: new Date() }
    });
  });

  return lista.boardId;
};
