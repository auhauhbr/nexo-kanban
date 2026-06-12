import { api } from "./cliente";
import type { ArquivadosQuadro, Quadro, ResumoQuadro } from "../tipos";

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

export const buscarQuadro = async (idQuadro: string) => {
  const { data: resposta } = await api.get<{ board: Quadro }>(
    `/boards/${idQuadro}`
  );
  return resposta.board;
};

export const atualizarTituloQuadro = async ({
  idQuadro,
  titulo
}: {
  idQuadro: string;
  titulo: string;
}) => {
  const { data: resposta } = await api.patch<{ board: Quadro }>(
    `/boards/${idQuadro}`,
    { title: titulo }
  );
  return resposta.board;
};

export const excluirQuadro = async (idQuadro: string) => {
  await api.delete(`/boards/${idQuadro}`);
};

export const buscarArquivados = async (idQuadro: string) => {
  const { data } = await api.get<{ archived: ArquivadosQuadro }>(
    `/boards/${idQuadro}/archived`
  );
  return data.archived;
};
