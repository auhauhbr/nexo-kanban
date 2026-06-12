import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";
import type {
  EntradaAtualizarEtiqueta,
  EntradaCriarEtiqueta
} from "./etiquetas.esquema.js";

const registrarAtualizacaoQuadro = (idQuadro: string) =>
  prisma.board.update({ where: { id: idQuadro }, data: { updatedAt: new Date() } });

const buscarEtiquetaDoProprietario = async (
  idProprietario: string,
  idEtiqueta: string
) => {
  const etiqueta = await prisma.label.findFirst({
    where: { id: idEtiqueta, board: { ownerId: idProprietario } }
  });

  if (!etiqueta) {
    throw new ErroAplicacao("Etiqueta não encontrada", 404);
  }

  return etiqueta;
};

const buscarCartaoDoProprietario = async (
  idProprietario: string,
  idCartao: string
) => {
  const cartao = await prisma.card.findFirst({
    where: { id: idCartao, list: { board: { ownerId: idProprietario } } },
    select: { id: true, list: { select: { boardId: true } } }
  });

  if (!cartao) {
    throw new ErroAplicacao("Cartão não encontrado", 404);
  }

  return cartao;
};

export const criarEtiqueta = async (
  idProprietario: string,
  idQuadro: string,
  entrada: EntradaCriarEtiqueta
) => {
  const quadro = await prisma.board.findFirst({
    where: { id: idQuadro, ownerId: idProprietario },
    select: { id: true }
  });

  if (!quadro) {
    throw new ErroAplicacao("Quadro não encontrado", 404);
  }

  const etiqueta = await prisma.label.create({
    data: { ...entrada, boardId: idQuadro }
  });
  await registrarAtualizacaoQuadro(idQuadro);

  return { label: etiqueta, boardId: idQuadro };
};

export const atualizarEtiqueta = async (
  idProprietario: string,
  idEtiqueta: string,
  entrada: EntradaAtualizarEtiqueta
) => {
  const etiqueta = await buscarEtiquetaDoProprietario(idProprietario, idEtiqueta);
  const atualizada = await prisma.label.update({
    where: { id: idEtiqueta },
    data: entrada
  });
  await registrarAtualizacaoQuadro(etiqueta.boardId);

  return { label: atualizada, boardId: etiqueta.boardId };
};

export const excluirEtiqueta = async (
  idProprietario: string,
  idEtiqueta: string
) => {
  const etiqueta = await buscarEtiquetaDoProprietario(idProprietario, idEtiqueta);
  await prisma.label.delete({ where: { id: idEtiqueta } });
  await registrarAtualizacaoQuadro(etiqueta.boardId);
  return etiqueta.boardId;
};

export const vincularEtiqueta = async (
  idProprietario: string,
  idCartao: string,
  idEtiqueta: string,
  vincular: boolean
) => {
  const [cartao, etiqueta] = await Promise.all([
    buscarCartaoDoProprietario(idProprietario, idCartao),
    buscarEtiquetaDoProprietario(idProprietario, idEtiqueta)
  ]);

  if (cartao.list.boardId !== etiqueta.boardId) {
    throw new ErroAplicacao("A etiqueta pertence a outro quadro", 400);
  }

  await prisma.card.update({
    where: { id: idCartao },
    data: {
      labels: vincular
        ? { connect: { id: idEtiqueta } }
        : { disconnect: { id: idEtiqueta } }
    }
  });
  await registrarAtualizacaoQuadro(cartao.list.boardId);

  return cartao.list.boardId;
};
