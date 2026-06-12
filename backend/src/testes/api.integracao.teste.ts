import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

import { io as createSocketClient, type Socket } from "socket.io-client";

import { aplicacao } from "../aplicacao.js";
import { prisma } from "../configuracao/prisma.js";
import { criarServidorTempoReal } from "../tempo-real/index.js";

const idExecucao = `${Date.now()}-${process.pid}`;
const prefixoEmail = `integracao-${idExecucao}`;
const senha = "password123";

let urlBase = "";
const clientes: Socket[] = [];
const servidor = createServer(aplicacao);
const servidorTempoReal = criarServidorTempoReal(servidor);

type JsonObject = Record<string, unknown>;

const requisicao = async (
  path: string,
  options: RequestInit = {}
): Promise<{ resposta: Response; body: JsonObject }> => {
  const resposta = await fetch(`${urlBase}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers
    }
  });
  const text = await resposta.text();

  return {
    resposta,
    body: text ? (JSON.parse(text) as JsonObject) : {}
  };
};

const post = (path: string, body: JsonObject, token?: string) =>
  requisicao(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });

const patch = (path: string, body: JsonObject, token: string) =>
  requisicao(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { authorization: `Bearer ${token}` }
  });

const get = (path: string, token?: string) =>
  requisicao(path, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });

const remove = (path: string, token: string) =>
  requisicao(path, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` }
  });

const registerUser = async (name: string, suffix: string) => {
  const email = `${prefixoEmail}-${suffix}@example.com`;
  const { resposta, body } = await post("/auth/register", {
    name,
    email,
    password: senha
  });

  assert.equal(resposta.status, 201);

  const user = body.user as JsonObject;
  assert.equal(user.email, email);
  assert.equal("password" in user, false);
  assert.equal(typeof body.token, "string");

  return {
    email,
    token: body.token as string
  };
};

const connectSocket = async (token: string) => {
  const client = createSocketClient(urlBase, {
    auth: { token },
    transports: ["websocket"]
  });
  clientes.push(client);

  await new Promise<void>((resolve, reject) => {
    client.once("connect", resolve);
    client.once("connect_error", reject);
  });

  return client;
};

const joinBoard = (client: Socket, boardId: string) =>
  new Promise<JsonObject>((resolve) => {
    client.emit("join-board", { boardId }, resolve);
  });

const waitForEvent = (client: Socket, event: string) =>
  new Promise<JsonObject>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Tempo esgotado aguardando o evento ${event}`));
    }, 3000);

    client.once(event, (payload) => {
      clearTimeout(timeout);
      resolve(payload as JsonObject);
    });
  });

before(async () => {
  servidor.listen(0);
  await new Promise<void>((resolve) => servidor.once("listening", resolve));
  const endereco = servidor.address() as AddressInfo;
  urlBase = `http://127.0.0.1:${endereco.port}`;
});

after(async () => {
  clientes.forEach((client) => client.disconnect());
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: prefixoEmail
      }
    }
  });
  await new Promise<void>((resolve) => {
    servidorTempoReal.close(() => resolve());
  });
  await prisma.$disconnect();
});

test("autenticação cadastra, conecta e protege a rota do usuário atual", async () => {
  const user = await registerUser("Auth Integration", "auth");

  const duplicate = await post("/auth/register", {
    name: "Duplicate",
    email: user.email,
    password: senha
  });
  assert.equal(duplicate.resposta.status, 409);

  const invalidLogin = await post("/auth/login", {
    email: user.email,
    password: "wrong-password"
  });
  assert.equal(invalidLogin.resposta.status, 401);

  const login = await post("/auth/login", {
    email: user.email,
    password: senha
  });
  assert.equal(login.resposta.status, 200);
  assert.equal(typeof login.body.token, "string");

  const withoutToken = await get("/auth/me");
  assert.equal(withoutToken.resposta.status, 401);

  const me = await get("/auth/me", login.body.token as string);
  assert.equal(me.resposta.status, 200);
  assert.equal((me.body.user as JsonObject).email, user.email);
});

test("CRUD do Kanban preserva proprietário e posições ordenadas", async () => {
  const owner = await registerUser("Kanban Owner", "owner");
  const other = await registerUser("Other User", "other");

  const createdBoard = await post(
    "/boards",
    { title: "Integration Board" },
    owner.token
  );
  assert.equal(createdBoard.resposta.status, 201);
  const board = createdBoard.body.board as JsonObject;
  const boardId = board.id as string;

  const otherBoardAccess = await get(`/boards/${boardId}`, other.token);
  assert.equal(otherBoardAccess.resposta.status, 404);

  const todoResponse = await post(
    `/boards/${boardId}/lists`,
    { title: "Todo" },
    owner.token
  );
  const doneResponse = await post(
    `/boards/${boardId}/lists`,
    { title: "Done" },
    owner.token
  );
  assert.equal(todoResponse.resposta.status, 201);
  assert.equal(doneResponse.resposta.status, 201);

  const todoId = (todoResponse.body.list as JsonObject).id as string;
  const doneId = (doneResponse.body.list as JsonObject).id as string;

  const firstCard = await post(
    `/lists/${todoId}/cards`,
    { title: "First" },
    owner.token
  );
  const secondCard = await post(
    `/lists/${todoId}/cards`,
    { title: "Second" },
    owner.token
  );
  assert.equal(firstCard.resposta.status, 201);
  assert.equal(secondCard.resposta.status, 201);

  const firstCardId = (firstCard.body.card as JsonObject).id as string;
  const secondCardId = (secondCard.body.card as JsonObject).id as string;

  const reordered = await patch(
    `/cards/${secondCardId}`,
    { position: 0 },
    owner.token
  );
  assert.equal(reordered.resposta.status, 200);

  const moved = await patch(
    `/cards/${secondCardId}`,
    { listId: doneId, position: 0, description: "Completed" },
    owner.token
  );
  assert.equal(moved.resposta.status, 200);

  const otherCardAccess = await patch(
    `/cards/${firstCardId}`,
    { title: "Unauthorized" },
    other.token
  );
  assert.equal(otherCardAccess.resposta.status, 404);

  const detail = await get(`/boards/${boardId}`, owner.token);
  assert.equal(detail.resposta.status, 200);
  const lists = (detail.body.board as JsonObject).lists as JsonObject[];
  assert.deepEqual(
    lists.map((list) => [list.title, list.position]),
    [
      ["Todo", 0],
      ["Done", 1]
    ]
  );
  assert.deepEqual(
    (lists[0]?.cards as JsonObject[]).map((card) => [
      card.title,
      card.position
    ]),
    [["First", 0]]
  );
  assert.deepEqual(
    (lists[1]?.cards as JsonObject[]).map((card) => [
      card.title,
      card.position
    ]),
    [["Second", 0]]
  );

  const deletedCard = await remove(`/cards/${firstCardId}`, owner.token);
  assert.equal(deletedCard.resposta.status, 204);

  const deletedBoard = await remove(`/boards/${boardId}`, owner.token);
  assert.equal(deletedBoard.resposta.status, 204);

  const afterDelete = await get(`/boards/${boardId}`, owner.token);
  assert.equal(afterDelete.resposta.status, 404);
});

test("salas em tempo real autenticam proprietários e publicam alterações REST", async () => {
  const owner = await registerUser("Realtime Owner", "realtime-owner");
  const other = await registerUser("Realtime Other", "realtime-other");

  const createdBoard = await post(
    "/boards",
    { title: "Realtime Board" },
    owner.token
  );
  const boardId = (createdBoard.body.board as JsonObject).id as string;

  const ownerSocket = await connectSocket(owner.token);
  const otherSocket = await connectSocket(other.token);

  const unauthenticatedSocket = createSocketClient(urlBase, {
    transports: ["websocket"]
  });
  const authenticationError = await new Promise<string>((resolve) => {
    unauthenticatedSocket.once("connect_error", (error) => {
      resolve(error.message);
    });
  });
  unauthenticatedSocket.disconnect();
  assert.equal(authenticationError, "O token de autenticação é obrigatório");

  assert.deepEqual(await joinBoard(ownerSocket, boardId), { ok: true });
  assert.deepEqual(await joinBoard(otherSocket, boardId), {
    ok: false,
    message: "Quadro não encontrado"
  });

  let otherReceivedEvent = false;
  otherSocket.once("list:created", () => {
    otherReceivedEvent = true;
  });

  const eventPromise = waitForEvent(ownerSocket, "list:created");
  const createdList = await post(
    `/boards/${boardId}/lists`,
    { title: "Realtime List" },
    owner.token
  );
  assert.equal(createdList.resposta.status, 201);

  const event = await eventPromise;
  assert.equal((event.list as JsonObject).title, "Realtime List");

  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(otherReceivedEvent, false);
});
