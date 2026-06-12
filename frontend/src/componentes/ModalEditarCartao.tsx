import { AlignLeft, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import type { Cartao } from "../tipos";

interface PropriedadesModalEditarCartao {
  cartao: Cartao;
  nomeLista: string;
  salvando: boolean;
  erro: string;
  aoFechar: () => void;
  aoSalvar: (titulo: string, descricao: string | null) => Promise<unknown>;
}

export function ModalEditarCartao({
  cartao,
  nomeLista,
  salvando,
  erro,
  aoFechar,
  aoSalvar
}: PropriedadesModalEditarCartao) {
  const [titulo, definirTitulo] = useState(cartao.title);
  const [descricao, definirDescricao] = useState(cartao.description ?? "");

  useEffect(() => {
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !salvando) {
        aoFechar();
      }
    };

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [aoFechar, salvando]);

  const enviarFormulario = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!titulo.trim()) {
      return;
    }

    try {
      await aoSalvar(titulo.trim(), descricao.trim() || null);
      aoFechar();
    } catch {
      // A mensagem da mutação permanece visível no modal.
    }
  };

  return (
    <div
      aria-labelledby="titulo-modal-cartao"
      aria-modal="true"
      className="fundo-modal"
      role="dialog"
    >
      <form className="modal-cartao" onSubmit={enviarFormulario}>
        <header>
          <div>
            <span>Cartão em {nomeLista}</span>
            <h2 id="titulo-modal-cartao">Editar cartão</h2>
          </div>
          <button
            aria-label="Fechar edição"
            disabled={salvando}
            onClick={aoFechar}
            type="button"
          >
            <X size={19} />
          </button>
        </header>

        <label htmlFor="titulo-cartao">
          Título
          <input
            autoFocus
            id="titulo-cartao"
            maxLength={200}
            onChange={(evento) => definirTitulo(evento.target.value)}
            required
            value={titulo}
          />
        </label>

        <label htmlFor="descricao-cartao">
          <span>
            <AlignLeft size={15} />
            Descrição
          </span>
          <textarea
            id="descricao-cartao"
            maxLength={5000}
            onChange={(evento) => definirDescricao(evento.target.value)}
            placeholder="Adicione mais detalhes sobre este cartão."
            rows={7}
            value={descricao}
          />
        </label>

        {erro ? <p className="erro-modal-cartao">{erro}</p> : null}

        <footer>
          <button disabled={salvando} onClick={aoFechar} type="button">
            Cancelar
          </button>
          <button disabled={salvando || !titulo.trim()} type="submit">
            {salvando ? "Salvando..." : "Salvar alterações"}
          </button>
        </footer>
      </form>
    </div>
  );
}
