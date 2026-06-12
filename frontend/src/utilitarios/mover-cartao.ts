import type { Quadro } from "../tipos";

export interface MovimentoCartao {
  idCartao: string;
  idListaDestino: string;
  posicaoDestino: number;
}

export const moverCartaoNoQuadro = (
  quadro: Quadro,
  { idCartao, idListaDestino, posicaoDestino }: MovimentoCartao
) => {
  const listas = quadro.lists.map((lista) => ({
    ...lista,
    cards: [...lista.cards]
  }));
  const listaOrigem = listas.find((lista) =>
    lista.cards.some((cartao) => cartao.id === idCartao)
  );
  const listaDestino = listas.find((lista) => lista.id === idListaDestino);

  if (!listaOrigem || !listaDestino) {
    return quadro;
  }

  const indiceOrigem = listaOrigem.cards.findIndex(
    (cartao) => cartao.id === idCartao
  );
  const [cartao] = listaOrigem.cards.splice(indiceOrigem, 1);

  if (!cartao) {
    return quadro;
  }

  const posicaoLimitada = Math.min(
    Math.max(posicaoDestino, 0),
    listaDestino.cards.length
  );
  listaDestino.cards.splice(posicaoLimitada, 0, {
    ...cartao,
    listId: idListaDestino
  });

  return {
    ...quadro,
    lists: listas.map((lista) => ({
      ...lista,
      cards: lista.cards.map((cartaoLista, position) => ({
        ...cartaoLista,
        position
      }))
    }))
  };
};
