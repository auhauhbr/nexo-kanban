import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { LayoutAutenticacao } from "../componentes/LayoutAutenticacao";
import { usarAutenticacao } from "../contexto/ContextoAutenticacao";
import { obterMensagemErro } from "../utilitarios/mensagem-erro";

export function PaginaCadastro() {
  const { cadastrar, usuario } = usarAutenticacao();
  const navegar = useNavigate();
  const [nome, definirNome] = useState("");
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [confirmacaoSenha, definirConfirmacaoSenha] = useState("");
  const [mostrarSenha, definirMostrarSenha] = useState(false);
  const [mostrarConfirmacao, definirMostrarConfirmacao] = useState(false);
  const [erro, definirErro] = useState("");
  const [enviando, definirEnviando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  const enviarFormulario = async (evento: FormEvent) => {
    evento.preventDefault();
    definirErro("");

    if (senha !== confirmacaoSenha) {
      definirErro("As senhas informadas não são iguais.");
      return;
    }

    definirEnviando(true);

    try {
      await cadastrar(nome, email, senha);
      navegar("/");
    } catch (erroRequisicao) {
      definirErro(
        obterMensagemErro(erroRequisicao, "Não foi possível criar a conta.")
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
            maxLength={80}
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
            maxLength={254}
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
              minLength={10}
              maxLength={72}
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
          <small className="requisitos-senha">
            <span className={senha.length >= 10 ? "requisito-atendido" : ""}>
              10 caracteres
            </span>
            <span className={/[A-Za-zÀ-ÿ]/.test(senha) ? "requisito-atendido" : ""}>
              uma letra
            </span>
            <span className={/[0-9]/.test(senha) ? "requisito-atendido" : ""}>
              um número
            </span>
          </small>
        </label>

        <label htmlFor="register-password-confirmation">
          Repita a senha
          <span className="campo-senha">
            <input
              autoComplete="new-password"
              id="register-password-confirmation"
              maxLength={72}
              minLength={10}
              onChange={(evento) => definirConfirmacaoSenha(evento.target.value)}
              required
              type={mostrarConfirmacao ? "text" : "password"}
              value={confirmacaoSenha}
            />
            <button
              aria-label={mostrarConfirmacao ? "Ocultar confirmação" : "Mostrar confirmação"}
              onClick={() => definirMostrarConfirmacao((visivel) => !visivel)}
              type="button"
            >
              {mostrarConfirmacao ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
          {confirmacaoSenha ? (
            <small className={senha === confirmacaoSenha ? "senhas-iguais" : "senhas-diferentes"}>
              {senha === confirmacaoSenha ? "As senhas são iguais." : "As senhas ainda não coincidem."}
            </small>
          ) : null}
        </label>

        {erro ? <p className="erro-formulario">{erro}</p> : null}

        <button
          className="botao-principal"
          disabled={
            enviando ||
            senha !== confirmacaoSenha ||
            senha.length < 10 ||
            !/[A-Za-zÀ-ÿ]/.test(senha) ||
            !/[0-9]/.test(senha)
          }
          type="submit"
        >
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
