import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import {
  controladorEntrada,
  controladorUsuarioAtual,
  controladorCadastro
} from "./autenticacao.controlador.js";

export const rotasAutenticacao = Router();

rotasAutenticacao.post("/register", controladorCadastro);
rotasAutenticacao.post("/login", controladorEntrada);
rotasAutenticacao.get("/me", intermediarioDeAutenticacao, controladorUsuarioAtual);
