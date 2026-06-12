import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

type TipoNotificacao = "sucesso" | "erro";

interface Notificacao {
  id: number;
  mensagem: string;
  tipo: TipoNotificacao;
}

interface ValorContextoNotificacoes {
  mostrarErro: (mensagem: string) => void;
  mostrarSucesso: (mensagem: string) => void;
}

const ContextoNotificacoes = createContext<ValorContextoNotificacoes | null>(
  null
);

export function ProvedorNotificacoes({ children }: { children: ReactNode }) {
  const [notificacoes, definirNotificacoes] = useState<Notificacao[]>([]);
  const proximoId = useRef(0);

  const mostrarNotificacao = useCallback(
    (mensagem: string, tipo: TipoNotificacao) => {
      const id = ++proximoId.current;

      definirNotificacoes((atuais) => [...atuais, { id, mensagem, tipo }]);
      window.setTimeout(() => {
        definirNotificacoes((atuais) =>
          atuais.filter((notificacao) => notificacao.id !== id)
        );
      }, 4000);
    },
    []
  );

  const valor = useMemo(
    () => ({
      mostrarErro: (mensagem: string) => mostrarNotificacao(mensagem, "erro"),
      mostrarSucesso: (mensagem: string) =>
        mostrarNotificacao(mensagem, "sucesso")
    }),
    [mostrarNotificacao]
  );

  return (
    <ContextoNotificacoes.Provider value={valor}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="notificacoes"
        role="status"
      >
        {notificacoes.map((notificacao) => (
          <div
            className={`notificacao notificacao-${notificacao.tipo}`}
            key={notificacao.id}
          >
            <span aria-hidden="true" />
            {notificacao.mensagem}
          </div>
        ))}
      </div>
    </ContextoNotificacoes.Provider>
  );
}

export function usarNotificacoes() {
  const contexto = useContext(ContextoNotificacoes);

  if (!contexto) {
    throw new Error(
      "usarNotificacoes deve ser utilizado dentro de ProvedorNotificacoes."
    );
  }

  return contexto;
}
