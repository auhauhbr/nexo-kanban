import { api } from "./cliente";
import type { Checklist, ItemChecklist } from "../tipos";

export const criarChecklist = async ({
  idCartao,
  titulo
}: {
  idCartao: string;
  titulo: string;
}) => {
  const { data } = await api.post<{ checklist: Checklist }>(
    `/cards/${idCartao}/checklists`,
    { title: titulo }
  );
  return data.checklist;
};

export const excluirChecklist = async (idChecklist: string) => {
  await api.delete(`/checklists/${idChecklist}`);
};

export const criarItem = async ({
  idChecklist,
  texto
}: {
  idChecklist: string;
  texto: string;
}) => {
  const { data } = await api.post<{ item: ItemChecklist }>(
    `/checklists/${idChecklist}/items`,
    { text: texto }
  );
  return data.item;
};

export const atualizarItem = async ({
  idItem,
  concluido
}: {
  idItem: string;
  concluido: boolean;
}) => {
  const { data } = await api.patch<{ item: ItemChecklist }>(
    `/checklist-items/${idItem}`,
    { done: concluido }
  );
  return data.item;
};

export const excluirItem = async (idItem: string) => {
  await api.delete(`/checklist-items/${idItem}`);
};
