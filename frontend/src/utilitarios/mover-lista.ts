import type { Quadro } from "../tipos";

export interface MovimentoLista {
  idLista: string;
  posicaoDestino: number;
}

export const moverListaNoQuadro = (
  quadro: Quadro,
  { idLista, posicaoDestino }: MovimentoLista
) => {
  const listas = [...quadro.lists];
  const indiceOrigem = listas.findIndex((lista) => lista.id === idLista);

  if (indiceOrigem === -1) {
    return quadro;
  }

  const [lista] = listas.splice(indiceOrigem, 1);

  if (!lista) {
    return quadro;
  }

  const posicaoLimitada = Math.min(
    Math.max(posicaoDestino, 0),
    listas.length
  );
  listas.splice(posicaoLimitada, 0, lista);

  return {
    ...quadro,
    lists: listas.map((listaQuadro, position) => ({
      ...listaQuadro,
      position
    }))
  };
};
