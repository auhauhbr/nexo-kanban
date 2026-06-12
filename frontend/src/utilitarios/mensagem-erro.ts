import axios from "axios";

export const obterMensagemErro = (erro: unknown, mensagemPadrao: string) =>
  axios.isAxiosError(erro)
    ? (erro.response?.data?.message ?? mensagemPadrao)
    : mensagemPadrao;
