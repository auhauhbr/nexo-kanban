import { api } from "./cliente";
import type { Etiqueta } from "../tipos";

export const criarEtiqueta = async ({
  idQuadro,
  nome,
  cor
}: {
  idQuadro: string;
  nome: string;
  cor: string;
}) => {
  const { data } = await api.post<{ label: Etiqueta }>(
    `/boards/${idQuadro}/labels`,
    { name: nome, color: cor }
  );
  return data.label;
};

export const vincularEtiqueta = async ({
  idCartao,
  idEtiqueta
}: {
  idCartao: string;
  idEtiqueta: string;
}) => {
  await api.post(`/cards/${idCartao}/labels/${idEtiqueta}`);
};

export const desvincularEtiqueta = async ({
  idCartao,
  idEtiqueta
}: {
  idCartao: string;
  idEtiqueta: string;
}) => {
  await api.delete(`/cards/${idCartao}/labels/${idEtiqueta}`);
};

export const excluirEtiqueta = async (idEtiqueta: string) => {
  await api.delete(`/labels/${idEtiqueta}`);
};
