import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import * as apiAutenticacao from "../api/autenticacao";
import { armazenamentoTokenAutenticacao } from "../api/cliente";
import type { Usuario } from "../tipos";

interface ValorContextoAutenticacao {
  usuario: Usuario | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => void;
}

const ContextoAutenticacao = createContext<ValorContextoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: PropsWithChildren) {
  const [usuario, definirUsuario] = useState<Usuario | null>(null);
  const [carregando, definirCarregando] = useState(true);

  useEffect(() => {
    if (!armazenamentoTokenAutenticacao.obter()) {
      definirCarregando(false);
      return;
    }

    apiAutenticacao
      .buscarUsuarioAtual()
      .then(definirUsuario)
      .catch(() => armazenamentoTokenAutenticacao.limpar())
      .finally(() => definirCarregando(false));
  }, []);

  const aplicarSessao = useCallback((proximoUsuario: Usuario, token: string) => {
    armazenamentoTokenAutenticacao.definir(token);
    definirUsuario(proximoUsuario);
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const sessao = await apiAutenticacao.entrar({ email, password: senha });
      aplicarSessao(sessao.user, sessao.token);
    },
    [aplicarSessao]
  );

  const cadastrar = useCallback(
    async (nome: string, email: string, senha: string) => {
      const sessao = await apiAutenticacao.cadastrar({
        name: nome,
        email,
        password: senha
      });
      aplicarSessao(sessao.user, sessao.token);
    },
    [aplicarSessao]
  );

  const sair = useCallback(() => {
    armazenamentoTokenAutenticacao.limpar();
    definirUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair }),
    [usuario, carregando, entrar, sair, cadastrar]
  );

  return (
    <ContextoAutenticacao.Provider value={valor}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export const usarAutenticacao = () => {
  const contexto = useContext(ContextoAutenticacao);

  if (!contexto) {
    throw new Error(
      "usarAutenticacao deve ser usado dentro de ProvedorAutenticacao"
    );
  }

  return contexto;
};
