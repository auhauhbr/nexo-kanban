import { api } from "./cliente";
import type { Cartao } from "../tipos";

export const criarCartao = async ({
  idLista,
  titulo,
  descricao
}: {
  idLista: string;
  titulo: string;
  descricao?: string;
}) => {
  const { data: resposta } = await api.post<{ card: Cartao }>(
    `/lists/${idLista}/cards`,
    {
      title: titulo,
      description: descricao || undefined
    }
  );
  return resposta.card;
};

export const atualizarCartao = async ({
  idCartao,
  titulo,
  descricao
}: {
  idCartao: string;
  titulo: string;
  descricao: string | null;
}) => {
  const { data: resposta } = await api.patch<{ card: Cartao }>(
    `/cards/${idCartao}`,
    {
      title: titulo,
      description: descricao
    }
  );
  return resposta.card;
};

export const moverCartao = async ({
  idCartao,
  idLista,
  posicao
}: {
  idCartao: string;
  idLista: string;
  posicao: number;
}) => {
  const { data: resposta } = await api.patch<{ card: Cartao }>(
    `/cards/${idCartao}`,
    {
      listId: idLista,
      position: posicao
    }
  );
  return resposta.card;
};

export const excluirCartao = async (idCartao: string) => {
  await api.delete(`/cards/${idCartao}`);
};
