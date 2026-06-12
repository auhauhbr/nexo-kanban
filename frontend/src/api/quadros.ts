import { api } from "./cliente";
import type { ResumoQuadro } from "../tipos";

export const listarQuadros = async () => {
  const { data: resposta } = await api.get<{ boards: ResumoQuadro[] }>("/boards");
  return resposta.boards;
};

export const criarQuadro = async (titulo: string) => {
  const { data: resposta } = await api.post<{ board: ResumoQuadro }>("/boards", {
    title: titulo
  });
  return resposta.board;
};
