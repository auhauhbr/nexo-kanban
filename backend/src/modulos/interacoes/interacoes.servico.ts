import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";

const buscarCartao = async (idUsuario: string, cardId: string) => {
  const cartao = await prisma.card.findFirst({
    where: { id: cardId, list: { board: { ownerId: idUsuario } } },
    select: { id: true, list: { select: { boardId: true } } }
  });
  if (!cartao) throw new ErroAplicacao("Cartão não encontrado", 404);
  return cartao;
};

export const criarComentario = async (
  idUsuario: string,
  cardId: string,
  message: string
) => {
  const cartao = await buscarCartao(idUsuario, cardId);
  const activity = await prisma.activity.create({
    data: { cardId, userId: idUsuario, type: "comment", message },
    include: { user: { select: { id: true, name: true } } }
  });
  return { activity, boardId: cartao.list.boardId };
};

export const criarAnexo = async (
  idUsuario: string,
  cardId: string,
  entrada: { title: string; url: string }
) => {
  const cartao = await buscarCartao(idUsuario, cardId);
  const attachment = await prisma.attachment.create({ data: { ...entrada, cardId } });
  await prisma.activity.create({
    data: { cardId, userId: idUsuario, type: "attachment", message: `anexou o link ${entrada.title}` }
  });
  return { attachment, boardId: cartao.list.boardId };
};

export const excluirAnexo = async (idUsuario: string, id: string) => {
  const anexo = await prisma.attachment.findFirst({
    where: { id, card: { list: { board: { ownerId: idUsuario } } } },
    select: { id: true, card: { select: { list: { select: { boardId: true } } } } }
  });
  if (!anexo) throw new ErroAplicacao("Anexo não encontrado", 404);
  await prisma.attachment.delete({ where: { id } });
  return anexo.card.list.boardId;
};
