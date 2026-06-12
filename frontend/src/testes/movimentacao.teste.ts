import assert from "node:assert/strict";
import test from "node:test";

import type { Cartao, Lista, Quadro } from "../tipos";
import { moverCartaoNoQuadro } from "../utilitarios/mover-cartao";
import { moverListaNoQuadro } from "../utilitarios/mover-lista";

const criarCartao = (id: string, listId: string, position: number): Cartao => ({
  id,
  title: id,
  description: null,
  dueDate: null,
  number: 1,
  coverColor: null,
  archived: false,
  labels: [],
  checklists: [],
  activities: [],
  attachments: [],
  listId,
  position,
  createdAt: "2026-06-12T00:00:00.000Z",
  updatedAt: "2026-06-12T00:00:00.000Z"
});

const criarLista = (id: string, position: number, cards: Cartao[]): Lista => ({
  id,
  title: id,
  boardId: "quadro-1",
  position,
  archived: false,
  cards,
  createdAt: "2026-06-12T00:00:00.000Z",
  updatedAt: "2026-06-12T00:00:00.000Z"
});

const criarQuadro = (): Quadro => ({
  id: "quadro-1",
  title: "Projeto",
  ownerId: "usuario-1",
  createdAt: "2026-06-12T00:00:00.000Z",
  updatedAt: "2026-06-12T00:00:00.000Z",
  labels: [],
  lists: [
    criarLista("lista-1", 0, [
      criarCartao("cartao-1", "lista-1", 0),
      criarCartao("cartao-2", "lista-1", 1)
    ]),
    criarLista("lista-2", 1, [criarCartao("cartao-3", "lista-2", 0)])
  ]
});

test("move cartão dentro da mesma lista e recalcula posições", () => {
  const quadro = criarQuadro();
  const resultado = moverCartaoNoQuadro(quadro, {
    idCartao: "cartao-2",
    idListaDestino: "lista-1",
    posicaoDestino: 0
  });

  assert.deepEqual(
    resultado.lists[0]?.cards.map((cartao) => [cartao.id, cartao.position]),
    [
      ["cartao-2", 0],
      ["cartao-1", 1]
    ]
  );
  assert.equal(quadro.lists[0]?.cards[0]?.id, "cartao-1");
});

test("move cartão entre listas e atualiza a lista de destino", () => {
  const resultado = moverCartaoNoQuadro(criarQuadro(), {
    idCartao: "cartao-1",
    idListaDestino: "lista-2",
    posicaoDestino: 1
  });

  assert.deepEqual(
    resultado.lists[1]?.cards.map((cartao) => [
      cartao.id,
      cartao.listId,
      cartao.position
    ]),
    [
      ["cartao-3", "lista-2", 0],
      ["cartao-1", "lista-2", 1]
    ]
  );
});

test("limita posição de cartão acima do tamanho da lista", () => {
  const resultado = moverCartaoNoQuadro(criarQuadro(), {
    idCartao: "cartao-1",
    idListaDestino: "lista-2",
    posicaoDestino: 99
  });

  assert.equal(resultado.lists[1]?.cards.at(-1)?.id, "cartao-1");
});

test("reordena listas e preserva o quadro original", () => {
  const quadro = criarQuadro();
  const resultado = moverListaNoQuadro(quadro, {
    idLista: "lista-2",
    posicaoDestino: 0
  });

  assert.deepEqual(
    resultado.lists.map((lista) => [lista.id, lista.position]),
    [
      ["lista-2", 0],
      ["lista-1", 1]
    ]
  );
  assert.equal(quadro.lists[0]?.id, "lista-1");
});

test("mantém quadro quando o item movido não existe", () => {
  const quadro = criarQuadro();

  assert.equal(
    moverCartaoNoQuadro(quadro, {
      idCartao: "inexistente",
      idListaDestino: "lista-1",
      posicaoDestino: 0
    }),
    quadro
  );
  assert.equal(
    moverListaNoQuadro(quadro, {
      idLista: "inexistente",
      posicaoDestino: 0
    }),
    quadro
  );
});
