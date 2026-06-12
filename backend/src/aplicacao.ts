import cors from "cors";
import express from "express";

import { ambiente } from "./configuracao/ambiente.js";
import { intermediarioDeErros } from "./intermediarios/erro.intermediario.js";
import { rotas } from "./rotas/index.js";

export const aplicacao = express();

aplicacao.disable("x-powered-by");
aplicacao.use(
  cors({
    origin: ambiente.FRONTEND_URL
  })
);
aplicacao.use(express.json());
aplicacao.use(rotas);
aplicacao.use(intermediarioDeErros);
