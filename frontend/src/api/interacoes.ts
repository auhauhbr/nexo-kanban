import { api } from "./cliente";
import type { Anexo, Atividade } from "../tipos";

export const comentar = async ({ idCartao, mensagem }: { idCartao: string; mensagem: string }) => {
  const { data } = await api.post<{ activity: Atividade }>(`/cards/${idCartao}/activities`, {
    message: mensagem
  });
  return data.activity;
};

export const anexarLink = async ({
  idCartao,
  titulo,
  url
}: {
  idCartao: string;
  titulo: string;
  url: string;
}) => {
  const { data } = await api.post<{ attachment: Anexo }>(`/cards/${idCartao}/attachments`, {
    title: titulo,
    url
  });
  return data.attachment;
};

export const excluirAnexo = async (idAnexo: string) => {
  await api.delete(`/attachments/${idAnexo}`);
};
