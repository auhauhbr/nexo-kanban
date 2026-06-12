import { createServer } from "node:http";

import { aplicacao } from "./aplicacao.js";
import { ambiente } from "./configuracao/ambiente.js";
import { prisma } from "./configuracao/prisma.js";
import { criarServidorTempoReal } from "./tempo-real/index.js";

const servidor = createServer(aplicacao);
const tempoReal = criarServidorTempoReal(servidor);

servidor.listen(ambiente.PORT, () => {
  console.log(`API do Kanban disponível em http://localhost:${ambiente.PORT}`);
});

const encerrar = () => {
  tempoReal.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGINT", encerrar);
process.on("SIGTERM", encerrar);
