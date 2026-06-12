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
