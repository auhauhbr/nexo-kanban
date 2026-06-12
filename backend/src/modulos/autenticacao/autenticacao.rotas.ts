import { Router } from "express";

import { intermediarioDeAutenticacao } from "../../intermediarios/autenticacao.intermediario.js";
import { limitarTentativasAutenticacao } from "../../intermediarios/seguranca.intermediario.js";
import {
  controladorEntrada,
  controladorUsuarioAtual,
  controladorCadastro
} from "./autenticacao.controlador.js";

export const rotasAutenticacao = Router();

rotasAutenticacao.post("/register", limitarTentativasAutenticacao, controladorCadastro);
rotasAutenticacao.post("/login", limitarTentativasAutenticacao, controladorEntrada);
rotasAutenticacao.get("/me", intermediarioDeAutenticacao, controladorUsuarioAtual);
