import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

import { io as createSocketClient, type Socket } from "socket.io-client";

import { app } from "../app.js";
import { prisma } from "../config/prisma.js";
import { createSocketServer } from "../sockets/index.js";

const runId = `${Date.now()}-${process.pid}`;
const emailPrefix = `integration-${runId}`;
const password = "password123";

let baseUrl = "";
const clients: Socket[] = [];
const server = createServer(app);
const socketServer = createSocketServer(server);

type JsonObject = Record<string, unknown>;

const request = async (
  path: string,
  options: RequestInit = {}
): Promise<{ response: Response; body: JsonObject }> => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers
    }
  });
  const text = await response.text();

  return {
    response,
    body: text ? (JSON.parse(text) as JsonObject) : {}
  };
};

const post = (path: string, body: JsonObject, token?: string) =>
  request(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });

const patch = (path: string, body: JsonObject, token: string) =>
  request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { authorization: `Bearer ${token}` }
  });

const get = (path: string, token?: string) =>
  request(path, {
    headers: token ? { authorization: `Bearer ${token}` } : undefined
  });

const remove = (path: string, token: string) =>
  request(path, {
    method: "DELETE",
    headers: { authorization: `Bearer ${token}` }
  });

const registerUser = async (name: string, suffix: string) => {
  const email = `${emailPrefix}-${suffix}@example.com`;
  const { response, body } = await post("/auth/register", {
    name,
    email,
    password
  });

  assert.equal(response.status, 201);

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
  const client = createSocketClient(baseUrl, {
    auth: { token },
    transports: ["websocket"]
  });
  clients.push(client);

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
      reject(new Error(`Timed out waiting for ${event}`));
    }, 3000);

    client.once(event, (payload) => {
      clearTimeout(timeout);
      resolve(payload as JsonObject);
    });
  });

before(async () => {
  server.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  clients.forEach((client) => client.disconnect());
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: emailPrefix
      }
    }
  });
  await new Promise<void>((resolve) => {
    socketServer.close(() => resolve());
  });
  await prisma.$disconnect();
});

test("auth registers, logs in and protects the current-user route", async () => {
  const user = await registerUser("Auth Integration", "auth");

  const duplicate = await post("/auth/register", {
    name: "Duplicate",
    email: user.email,
    password
  });
  assert.equal(duplicate.response.status, 409);

  const invalidLogin = await post("/auth/login", {
    email: user.email,
    password: "wrong-password"
  });
  assert.equal(invalidLogin.response.status, 401);

  const login = await post("/auth/login", {
    email: user.email,
    password
  });
  assert.equal(login.response.status, 200);
  assert.equal(typeof login.body.token, "string");

  const withoutToken = await get("/auth/me");
  assert.equal(withoutToken.response.status, 401);

  const me = await get("/auth/me", login.body.token as string);
  assert.equal(me.response.status, 200);
  assert.equal((me.body.user as JsonObject).email, user.email);
});

test("kanban CRUD preserves ownership and ordered positions", async () => {
  const owner = await registerUser("Kanban Owner", "owner");
  const other = await registerUser("Other User", "other");

  const createdBoard = await post(
    "/boards",
    { title: "Integration Board" },
    owner.token
  );
  assert.equal(createdBoard.response.status, 201);
  const board = createdBoard.body.board as JsonObject;
  const boardId = board.id as string;

  const otherBoardAccess = await get(`/boards/${boardId}`, other.token);
  assert.equal(otherBoardAccess.response.status, 404);

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
  assert.equal(todoResponse.response.status, 201);
  assert.equal(doneResponse.response.status, 201);

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
  assert.equal(firstCard.response.status, 201);
  assert.equal(secondCard.response.status, 201);

  const firstCardId = (firstCard.body.card as JsonObject).id as string;
  const secondCardId = (secondCard.body.card as JsonObject).id as string;

  const reordered = await patch(
    `/cards/${secondCardId}`,
    { position: 0 },
    owner.token
  );
  assert.equal(reordered.response.status, 200);

  const moved = await patch(
    `/cards/${secondCardId}`,
    { listId: doneId, position: 0, description: "Completed" },
    owner.token
  );
  assert.equal(moved.response.status, 200);

  const otherCardAccess = await patch(
    `/cards/${firstCardId}`,
    { title: "Unauthorized" },
    other.token
  );
  assert.equal(otherCardAccess.response.status, 404);

  const detail = await get(`/boards/${boardId}`, owner.token);
  assert.equal(detail.response.status, 200);
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
  assert.equal(deletedCard.response.status, 204);

  const deletedBoard = await remove(`/boards/${boardId}`, owner.token);
  assert.equal(deletedBoard.response.status, 204);

  const afterDelete = await get(`/boards/${boardId}`, owner.token);
  assert.equal(afterDelete.response.status, 404);
});

test("realtime rooms authenticate owners and publish REST changes", async () => {
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

  const unauthenticatedSocket = createSocketClient(baseUrl, {
    transports: ["websocket"]
  });
  const authenticationError = await new Promise<string>((resolve) => {
    unauthenticatedSocket.once("connect_error", (error) => {
      resolve(error.message);
    });
  });
  unauthenticatedSocket.disconnect();
  assert.equal(authenticationError, "Authentication token is required");

  assert.deepEqual(await joinBoard(ownerSocket, boardId), { ok: true });
  assert.deepEqual(await joinBoard(otherSocket, boardId), {
    ok: false,
    message: "Board not found"
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
  assert.equal(createdList.response.status, 201);

  const event = await eventPromise;
  assert.equal((event.list as JsonObject).title, "Realtime List");

  await new Promise((resolve) => setTimeout(resolve, 100));
  assert.equal(otherReceivedEvent, false);
});
