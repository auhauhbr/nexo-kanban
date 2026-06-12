import axios from "axios";

const chaveToken = "nexo:token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333"
});

api.interceptors.request.use((configuracao) => {
  const token = localStorage.getItem(chaveToken);

  if (token) {
    configuracao.headers.Authorization = `Bearer ${token}`;
  }

  return configuracao;
});

export const armazenamentoTokenAutenticacao = {
  obter: () => localStorage.getItem(chaveToken),
  definir: (token: string) => localStorage.setItem(chaveToken, token),
  limpar: () => localStorage.removeItem(chaveToken)
};
