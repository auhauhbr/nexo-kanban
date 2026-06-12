import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";
import type {
  EntradaAtualizarItemChecklist,
  EntradaCriarChecklist,
  EntradaCriarItemChecklist
} from "./checklists.esquema.js";

const registrarAtualizacaoQuadro = (idQuadro: string) =>
  prisma.board.update({ where: { id: idQuadro }, data: { updatedAt: new Date() } });

const buscarCartao = async (idProprietario: string, idCartao: string) => {
  const cartao = await prisma.card.findFirst({
    where: { id: idCartao, list: { board: { ownerId: idProprietario } } },
    select: { id: true, list: { select: { boardId: true } } }
  });
  if (!cartao) throw new ErroAplicacao("Cartão não encontrado", 404);
  return cartao;
};

const buscarChecklist = async (idProprietario: string, idChecklist: string) => {
  const checklist = await prisma.checklist.findFirst({
    where: { id: idChecklist, card: { list: { board: { ownerId: idProprietario } } } },
    select: { id: true, position: true, cardId: true, card: { select: { list: { select: { boardId: true } } } } }
  });
  if (!checklist) throw new ErroAplicacao("Checklist não encontrado", 404);
  return checklist;
};

const buscarItem = async (idProprietario: string, idItem: string) => {
  const item = await prisma.checklistItem.findFirst({
    where: { id: idItem, checklist: { card: { list: { board: { ownerId: idProprietario } } } } },
    select: { id: true, checklistId: true, checklist: { select: { card: { select: { list: { select: { boardId: true } } } } } } }
  });
  if (!item) throw new ErroAplicacao("Item de checklist não encontrado", 404);
  return item;
};

export const criarChecklist = async (
  idProprietario: string,
  idCartao: string,
  entrada: EntradaCriarChecklist
) => {
  const cartao = await buscarCartao(idProprietario, idCartao);
  const ultimo = await prisma.checklist.findFirst({
    where: { cardId: idCartao },
    orderBy: { position: "desc" },
    select: { position: true }
  });
  const checklist = await prisma.checklist.create({
    data: { title: entrada.title, position: (ultimo?.position ?? -1) + 1, cardId: idCartao },
    include: { items: true }
  });
  await registrarAtualizacaoQuadro(cartao.list.boardId);
  return { checklist, boardId: cartao.list.boardId };
};

export const excluirChecklist = async (idProprietario: string, idChecklist: string) => {
  const checklist = await buscarChecklist(idProprietario, idChecklist);
  await prisma.$transaction([
    prisma.checklist.delete({ where: { id: idChecklist } }),
    prisma.checklist.updateMany({
      where: { cardId: checklist.cardId, position: { gt: checklist.position } },
      data: { position: { decrement: 1 } }
    })
  ]);
  await registrarAtualizacaoQuadro(checklist.card.list.boardId);
  return checklist.card.list.boardId;
};

export const criarItemChecklist = async (
  idProprietario: string,
  idChecklist: string,
  entrada: EntradaCriarItemChecklist
) => {
  const checklist = await buscarChecklist(idProprietario, idChecklist);
  const ultimo = await prisma.checklistItem.findFirst({
    where: { checklistId: idChecklist },
    orderBy: { position: "desc" },
    select: { position: true }
  });
  const item = await prisma.checklistItem.create({
    data: { text: entrada.text, position: (ultimo?.position ?? -1) + 1, checklistId: idChecklist }
  });
  await registrarAtualizacaoQuadro(checklist.card.list.boardId);
  return { item, boardId: checklist.card.list.boardId };
};

export const atualizarItemChecklist = async (
  idProprietario: string,
  idItem: string,
  entrada: EntradaAtualizarItemChecklist
) => {
  const item = await buscarItem(idProprietario, idItem);
  const atualizado = await prisma.checklistItem.update({
    where: { id: idItem },
    data: entrada
  });
  await registrarAtualizacaoQuadro(item.checklist.card.list.boardId);
  return { item: atualizado, boardId: item.checklist.card.list.boardId };
};

export const excluirItemChecklist = async (idProprietario: string, idItem: string) => {
  const item = await buscarItem(idProprietario, idItem);
  await prisma.checklistItem.delete({ where: { id: idItem } });
  await registrarAtualizacaoQuadro(item.checklist.card.list.boardId);
  return item.checklist.card.list.boardId;
};
