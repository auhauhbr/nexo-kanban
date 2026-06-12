import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";

const buscarQuadroDoProprietario = async (idUsuario: string, idQuadro: string) => {
  const quadro = await prisma.board.findFirst({
    where: { id: idQuadro, ownerId: idUsuario },
    select: { id: true }
  });
  if (!quadro) throw new ErroAplicacao("Quadro não encontrado", 404);
  return quadro;
};

export const listarArquivados = async (idUsuario: string, idQuadro: string) => {
  await buscarQuadroDoProprietario(idUsuario, idQuadro);

  const [listas, cartoes] = await prisma.$transaction([
    prisma.list.findMany({
      where: { boardId: idQuadro, archived: true },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { cards: true } } }
    }),
    prisma.card.findMany({
      where: {
        archived: true,
        list: { boardId: idQuadro }
      },
      orderBy: { updatedAt: "desc" },
      include: {
        list: { select: { id: true, title: true, archived: true } }
      }
    })
  ]);

  return { lists: listas, cards: cartoes };
};

export const restaurarLista = async (idUsuario: string, idLista: string) => {
  const lista = await prisma.list.findFirst({
    where: { id: idLista, archived: true, board: { ownerId: idUsuario } }
  });
  if (!lista) throw new ErroAplicacao("Lista arquivada não encontrada", 404);

  return prisma.list.update({
    where: { id: idLista },
    data: { archived: false },
    include: { cards: { where: { archived: false }, orderBy: { position: "asc" } } }
  });
};

export const restaurarCartao = async (
  idUsuario: string,
  idCartao: string,
  idListaDestino?: string
) => {
  const cartao = await prisma.card.findFirst({
    where: { id: idCartao, archived: true, list: { board: { ownerId: idUsuario } } },
    include: { list: { select: { id: true, boardId: true, archived: true } } }
  });
  if (!cartao) throw new ErroAplicacao("Cartão arquivado não encontrado", 404);

  const idLista = idListaDestino ?? cartao.listId;
  const listaDestino = await prisma.list.findFirst({
    where: {
      id: idLista,
      boardId: cartao.list.boardId,
      board: { ownerId: idUsuario }
    }
  });
  if (!listaDestino) throw new ErroAplicacao("Lista de destino não encontrada", 404);
  if (listaDestino.archived) {
    throw new ErroAplicacao("A lista de destino está arquivada", 400);
  }

  const quantidadeCartoes = await prisma.card.count({
    where: { listId: idLista, archived: false }
  });
  const card = await prisma.card.update({
    where: { id: idCartao },
    data: { archived: false, listId: idLista, position: quantidadeCartoes }
  });
  return { card, boardId: cartao.list.boardId };
};
