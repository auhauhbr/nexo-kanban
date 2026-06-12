import { io } from "socket.io-client";

import { armazenamentoTokenAutenticacao } from "../api/cliente";

const urlTempoReal =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:3333";

export const criarClienteTempoReal = () =>
  io(urlTempoReal, {
    auth: {
      token: armazenamentoTokenAutenticacao.obter()
    },
    transports: ["websocket"],
    autoConnect: false
  });
