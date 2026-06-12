import cors from "cors";
import express from "express";

import { ambiente } from "./configuracao/ambiente.js";
import { intermediarioDeErros } from "./intermediarios/erro.intermediario.js";
import { intermediarioCabecalhosSeguros } from "./intermediarios/seguranca.intermediario.js";
import { rotas } from "./rotas/index.js";

export const aplicacao = express();

aplicacao.disable("x-powered-by");
aplicacao.use(intermediarioCabecalhosSeguros);
aplicacao.use(
  cors({
    origin: ambiente.FRONTEND_URL
  })
);
aplicacao.use(express.json({ limit: "100kb" }));
aplicacao.use(rotas);
aplicacao.use(intermediarioDeErros);
