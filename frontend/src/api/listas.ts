import { api } from "./cliente";
import type { Lista } from "../tipos";

export const criarLista = async ({
  idQuadro,
  titulo
}: {
  idQuadro: string;
  titulo: string;
}) => {
  const { data: resposta } = await api.post<{ list: Lista }>(
    `/boards/${idQuadro}/lists`,
    { title: titulo }
  );
  return resposta.list;
};

export const atualizarTituloLista = async ({
  idLista,
  titulo
}: {
  idLista: string;
  titulo: string;
}) => {
  const { data: resposta } = await api.patch<{ list: Lista }>(
    `/lists/${idLista}`,
    { title: titulo }
  );
  return resposta.list;
};

export const excluirLista = async (idLista: string) => {
  await api.delete(`/lists/${idLista}`);
};
