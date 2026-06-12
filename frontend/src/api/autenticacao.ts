import { api } from "./cliente";
import type { RespostaAutenticacao, Usuario } from "../tipos";

export const cadastrar = async (entrada: {
  name: string;
  email: string;
  password: string;
}) => {
  const { data: resposta } = await api.post<RespostaAutenticacao>(
    "/auth/register",
    entrada
  );
  return resposta;
};

export const entrar = async (entrada: { email: string; password: string }) => {
  const { data: resposta } = await api.post<RespostaAutenticacao>(
    "/auth/login",
    entrada
  );
  return resposta;
};

export const buscarUsuarioAtual = async () => {
  const { data: resposta } = await api.get<{ user: Usuario }>("/auth/me");
  return resposta.user;
};
