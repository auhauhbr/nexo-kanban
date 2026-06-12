import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { criarClienteTempoReal } from "../tempo-real/cliente";

type EstadoConexao = "conectando" | "conectado" | "desconectado" | "erro";

export const usarTempoRealQuadro = (idQuadro: string) => {
  const clienteConsultas = useQueryClient();
  const [estado, definirEstado] = useState<EstadoConexao>("conectando");

  useEffect(() => {
    if (!idQuadro) {
      definirEstado("desconectado");
      return;
    }

    const cliente = criarClienteTempoReal();
    const atualizarQuadro = ({ boardId }: { boardId: string }) => {
      if (boardId !== idQuadro) {
        return;
      }

      clienteConsultas.invalidateQueries({ queryKey: ["quadro", idQuadro] });
      clienteConsultas.invalidateQueries({ queryKey: ["quadros"] });
    };

    cliente.on("connect", () => {
      definirEstado("conectado");
      cliente.emit(
        "join-board",
        { boardId: idQuadro },
        (resposta: { ok: boolean }) => {
          if (!resposta.ok) {
            definirEstado("erro");
          }
        }
      );
    });
    cliente.on("disconnect", () => definirEstado("desconectado"));
    cliente.on("connect_error", () => definirEstado("erro"));
    cliente.on("board:updated", atualizarQuadro);
    cliente.connect();

    return () => {
      cliente.off("board:updated", atualizarQuadro);
      cliente.disconnect();
    };
  }, [clienteConsultas, idQuadro]);

  return estado;
};
