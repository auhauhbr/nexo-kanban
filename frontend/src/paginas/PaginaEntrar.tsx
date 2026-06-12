import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { LayoutAutenticacao } from "../componentes/LayoutAutenticacao";
import { usarAutenticacao } from "../contexto/ContextoAutenticacao";
import { obterMensagemErro } from "../utilitarios/mensagem-erro";

export function PaginaEntrar() {
  const { entrar, usuario } = usarAutenticacao();
  const navegar = useNavigate();
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
      await entrar(email, senha);
      navegar("/");
    } catch (erroRequisicao) {
      definirErro(obterMensagemErro(erroRequisicao, "Não foi possível entrar."));
    } finally {
      definirEnviando(false);
    }
  };

  return (
    <LayoutAutenticacao>
      <form className="formulario-autenticacao" onSubmit={enviarFormulario}>
        <header>
          <h1>Entre na sua conta</h1>
          <p>
            Organize projetos, acompanhe o progresso e mantenha tudo em
            movimento.
          </p>
        </header>

        <label htmlFor="login-email">
          E-mail
          <input
            autoComplete="email"
            id="login-email"
            onChange={(evento) => definirEmail(evento.target.value)}
            placeholder="seu@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label htmlFor="login-password">
          Senha
          <span className="campo-senha">
            <input
              autoComplete="current-password"
              id="login-password"
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
        </label>

        {erro ? <p className="erro-formulario">{erro}</p> : null}

        <button className="botao-principal" disabled={enviando} type="submit">
          {enviando ? "Entrando..." : "Entrar"}
          <ArrowRight size={19} />
        </button>

        <p className="alternar-autenticacao">
          Ainda não tem uma conta? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </LayoutAutenticacao>
  );
}
