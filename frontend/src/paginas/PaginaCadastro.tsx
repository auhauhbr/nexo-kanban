import axios from "axios";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { LayoutAutenticacao } from "../componentes/LayoutAutenticacao";
import { usarAutenticacao } from "../contexto/ContextoAutenticacao";

export function PaginaCadastro() {
  const { cadastrar, usuario } = usarAutenticacao();
  const navegar = useNavigate();
  const [nome, definirNome] = useState("");
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  const [erro, definirErro] = useState("");
  const [enviando, definirEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const enviarFormulario = async (evento: FormEvent) => {
    evento.preventDefault();
    definirErro("");
    definirEnviando(true);

    try {
      await cadastrar(nome, email, senha);
      navegar("/");
    } catch (erroRequisicao) {
      definirErro(
        axios.isAxiosError(erroRequisicao)
          ? (erroRequisicao.response?.data?.message ?? "Não foi possível criar a conta.")
          : "Não foi possível criar a conta."
      );
    } finally {
      definirEnviando(false);
    }
  };

  return (
    <LayoutAutenticacao>
      <form className="formulario-autenticacao" onSubmit={enviarFormulario}>
        <header>
          <h1>Crie sua conta</h1>
          <p>Comece seu primeiro quadro e transforme planos em progresso.</p>
        </header>

        <label htmlFor="register-name">
          Nome
          <input
            autoComplete="name"
            id="register-name"
            minLength={2}
            onChange={(evento) => definirNome(evento.target.value)}
            placeholder="Seu nome"
            required
            value={nome}
          />
        </label>

        <label htmlFor="register-email">
          E-mail
          <input
            autoComplete="email"
            id="register-email"
            onChange={(evento) => definirEmail(evento.target.value)}
            placeholder="seu@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label htmlFor="register-password">
          Senha
          <span className="campo-senha">
            <input
              autoComplete="new-password"
              id="register-password"
              minLength={8}
              onChange={(evento) => definirSenha(evento.target.value)}
              required
              type={mostrarSenha ? "text" : "password"}
              value={senha}
            />
            <button
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => definirMostrarSenha((visivel) => !visivel)}
              type="button"
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          <small>Mínimo de 8 caracteres.</small>
        </label>

        {erro ? <p className="erro-formulario">{erro}</p> : null}

        <button className="botao-principal" disabled={enviando} type="submit">
          {enviando ? "Criando..." : "Criar conta"}
          <ArrowRight size={19} />
        </button>

        <p className="alternar-autenticacao">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </LayoutAutenticacao>
  );
}
