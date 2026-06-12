import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";
import type {
  EntradaCriarQuadro,
  EntradaAtualizarQuadro
} from "./quadros.esquema.js";

const inclusaoDetalhesQuadro = {
  labels: {
    orderBy: {
      createdAt: "asc"
    }
  },
  lists: {
    where: { archived: false },
    orderBy: {
      position: "asc"
    },
    include: {
      cards: {
        where: { archived: false },
        orderBy: {
          position: "asc"
        },
        include: {
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
        }
      }
    }
  }
} as const;

export const listarQuadros = (idProprietario: string) =>
  prisma.board.findMany({
    where: { ownerId: idProprietario },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          lists: true
        }
      }
    }
  });

export const criarQuadro = (idProprietario: string, entrada: EntradaCriarQuadro) =>
  prisma.board.create({
    data: {
      title: entrada.title,
      ownerId: idProprietario
    },
    include: inclusaoDetalhesQuadro
  });

export const buscarQuadro = async (idProprietario: string, idQuadro: string) => {
  const quadro = await prisma.board.findFirst({
    where: {
      id: idQuadro,
      ownerId: idProprietario
    },
    include: inclusaoDetalhesQuadro
  });

  if (!quadro) {
    throw new ErroAplicacao("Quadro não encontrado", 404);
  }

  return quadro;
};

export const atualizarQuadro = async (
  idProprietario: string,
  idQuadro: string,
  entrada: EntradaAtualizarQuadro
) => {
  await buscarQuadro(idProprietario, idQuadro);

  return prisma.board.update({
    where: { id: idQuadro },
    data: { title: entrada.title },
    include: inclusaoDetalhesQuadro
  });
};

export const excluirQuadro = async (idProprietario: string, idQuadro: string) => {
  await buscarQuadro(idProprietario, idQuadro);
  await prisma.board.delete({
    where: { id: idQuadro }
  });
};
