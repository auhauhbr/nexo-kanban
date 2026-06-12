import { createServer } from "node:http";

import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { createSocketServer } from "./sockets/index.js";

const server = createServer(app);
const io = createSocketServer(server);

server.listen(env.PORT, () => {
  console.log(`Kanban API running at http://localhost:${env.PORT}`);
});

const shutdown = () => {
  io.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
