import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ambiente } from "../../configuracao/ambiente.js";
import { prisma } from "../../configuracao/prisma.js";
import { ErroAplicacao } from "../../utilitarios/erro-aplicacao.js";
import type { EntradaLogin, EntradaCadastro } from "./autenticacao.esquema.js";

const selecaoUsuarioPublico = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true
} as const;

const criarToken = (idUsuario: string) =>
  jwt.sign({}, ambiente.JWT_SECRET, {
    subject: idUsuario,
    expiresIn: "7d"
  });

export const cadastrarUsuario = async (entrada: EntradaCadastro) => {
  const usuarioExistente = await prisma.user.findUnique({
    where: { email: entrada.email },
    select: { id: true }
  });

  if (usuarioExistente) {
    throw new ErroAplicacao("Já existe uma conta com este e-mail", 409);
  }

  const senhaCriptografada = await bcrypt.hash(entrada.password, 12);
  const usuario = await prisma.user.create({
    data: {
      name: entrada.name,
      email: entrada.email,
      password: senhaCriptografada
    },
    select: selecaoUsuarioPublico
  });

  return {
    user: usuario,
    token: criarToken(usuario.id)
  };
};

export const entrarUsuario = async (entrada: EntradaLogin) => {
  const usuarioComSenha = await prisma.user.findUnique({
    where: { email: entrada.email }
  });

  if (!usuarioComSenha) {
    throw new ErroAplicacao("E-mail ou senha inválidos", 401);
  }

  const senhaCorresponde = await bcrypt.compare(
    entrada.password,
    usuarioComSenha.password
  );

  if (!senhaCorresponde) {
    throw new ErroAplicacao("E-mail ou senha inválidos", 401);
  }

  const { password: _senha, ...usuario } = usuarioComSenha;

  return {
    user: usuario,
    token: criarToken(usuario.id)
  };
};

export const buscarUsuarioAtual = async (idUsuario: string) => {
  const usuario = await prisma.user.findUnique({
    where: { id: idUsuario },
    select: selecaoUsuarioPublico
  });

  if (!usuario) {
    throw new ErroAplicacao("Usuário não encontrado", 404);
  }

  return usuario;
};
