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

export const moverLista = async ({
  idLista,
  posicao
}: {
  idLista: string;
  posicao: number;
}) => {
  const { data: resposta } = await api.patch<{ list: Lista }>(
    `/lists/${idLista}`,
    { position: posicao }
  );
  return resposta.list;
};

export const arquivarLista = async (idLista: string) => {
  const { data } = await api.patch<{ list: Lista }>(`/lists/${idLista}`, {
    archived: true
  });
  return data.list;
};

export const definirLimiteLista = async ({
  idLista,
  limite
}: {
  idLista: string;
  limite: number | null;
}) => {
  const { data } = await api.patch<{ list: Lista }>(`/lists/${idLista}`, {
    wipLimit: limite
  });
  return data.list;
};

export const restaurarLista = async (idLista: string) => {
  const { data } = await api.patch<{ list: Lista }>(`/lists/${idLista}/restaurar`);
  return data.list;
};
