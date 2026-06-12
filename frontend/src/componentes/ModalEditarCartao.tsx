import { AlignLeft, Archive, CalendarDays, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { Cartao, Etiqueta } from "../tipos";
import { RecursosCartao } from "./RecursosCartao";
import { InteracoesCartao } from "./InteracoesCartao";

interface PropriedadesModalEditarCartao {
  cartao: Cartao;
  nomeLista: string;
  salvando: boolean;
  excluindo: boolean;
  erro: string;
  erroExclusao: string;
  etiquetasQuadro: Etiqueta[];
  aoFechar: () => void;
  aoExcluir: () => Promise<unknown>;
  aoSalvar: (titulo: string, descricao: string | null, prazo: string | null) => Promise<unknown>;
  aoCriarEtiqueta: (nome: string, cor: string) => Promise<unknown>;
  aoAlternarEtiqueta: (idEtiqueta: string, vinculada: boolean) => Promise<unknown>;
  aoExcluirEtiqueta: (idEtiqueta: string) => Promise<unknown>;
  aoCriarChecklist: (titulo: string) => Promise<unknown>;
  aoExcluirChecklist: (idChecklist: string) => Promise<unknown>;
  aoCriarItem: (idChecklist: string, texto: string) => Promise<unknown>;
  aoAlternarItem: (idItem: string, concluido: boolean) => Promise<unknown>;
  aoExcluirItem: (idItem: string) => Promise<unknown>;
  aoAlterarCapa: (cor: string | null) => Promise<unknown>;
  aoArquivar: () => Promise<unknown>;
  aoComentar: (mensagem: string) => Promise<unknown>;
  aoAnexarLink: (titulo: string, url: string) => Promise<unknown>;
  aoExcluirAnexo: (idAnexo: string) => Promise<unknown>;
}

export function ModalEditarCartao({
  cartao,
  nomeLista,
  salvando,
  excluindo,
  erro,
  erroExclusao,
  etiquetasQuadro,
  aoFechar,
  aoExcluir,
  aoSalvar,
  aoCriarEtiqueta,
  aoAlternarEtiqueta,
  aoExcluirEtiqueta,
  aoCriarChecklist,
  aoExcluirChecklist,
  aoCriarItem,
  aoAlternarItem,
  aoExcluirItem,
  aoAlterarCapa,
  aoArquivar,
  aoComentar,
  aoAnexarLink,
  aoExcluirAnexo
}: PropriedadesModalEditarCartao) {
  const [titulo, definirTitulo] = useState(cartao.title);
  const [descricao, definirDescricao] = useState(cartao.description ?? "");
  const [prazo, definirPrazo] = useState(
    cartao.dueDate ? new Date(cartao.dueDate).toISOString().slice(0, 16) : ""
  );
  const [confirmandoExclusao, definirConfirmandoExclusao] = useState(false);
  const ocupado = salvando || excluindo;

  useEffect(() => {
    const fecharComEscape = (evento: KeyboardEvent) => {
      if (evento.key === "Escape" && !ocupado) {
        aoFechar();
      }
    };

    window.addEventListener("keydown", fecharComEscape);
    return () => window.removeEventListener("keydown", fecharComEscape);
  }, [aoFechar, ocupado]);

  const salvar = async () => {
    if (!titulo.trim()) {
      return;
    }

    try {
      await aoSalvar(
        titulo.trim(),
        descricao.trim() || null,
        prazo ? new Date(prazo).toISOString() : null
      );
      aoFechar();
    } catch {
      // A mensagem da mutação permanece visível no modal.
    }
  };

  const excluir = async () => {
    try {
      await aoExcluir();
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
      <div className="modal-cartao">
        <header>
          <div>
            <span>Cartão #{cartao.number || "—"} em {nomeLista}</span>
            <h2 id="titulo-modal-cartao">Editar cartão</h2>
          </div>
          <button
            aria-label="Fechar edição"
            disabled={ocupado}
            onClick={aoFechar}
            type="button"
          >
            <X size={19} />
          </button>
        </header>

        {cartao.coverColor ? (
          <div className="capa-modal-cartao" style={{ background: cartao.coverColor }} />
        ) : null}

        <div className="conteudo-modal-cartao">
          <div className="edicao-modal-cartao">
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

            <label htmlFor="prazo-cartao">
              <span>
                <CalendarDays size={15} />
                Prazo
              </span>
              <input
                id="prazo-cartao"
                onChange={(evento) => definirPrazo(evento.target.value)}
                type="datetime-local"
                value={prazo}
              />
            </label>

            <RecursosCartao
              aoAlterarCapa={aoAlterarCapa}
              aoAlternarEtiqueta={aoAlternarEtiqueta}
              aoAlternarItem={aoAlternarItem}
              aoCriarChecklist={aoCriarChecklist}
              aoCriarEtiqueta={aoCriarEtiqueta}
              aoCriarItem={aoCriarItem}
              aoExcluirChecklist={aoExcluirChecklist}
              aoExcluirEtiqueta={aoExcluirEtiqueta}
              aoExcluirItem={aoExcluirItem}
              cartao={cartao}
              etiquetasQuadro={etiquetasQuadro}
              ocupado={ocupado}
            />
          </div>
          <InteracoesCartao
            aoAnexarLink={aoAnexarLink}
            aoComentar={aoComentar}
            aoExcluirAnexo={aoExcluirAnexo}
            cartao={cartao}
            ocupado={ocupado}
          />
        </div>

        {erro ? <p className="erro-modal-cartao">{erro}</p> : null}
        {erroExclusao ? (
          <p className="erro-modal-cartao">{erroExclusao}</p>
        ) : null}

        <footer>
          {confirmandoExclusao ? (
            <div className="confirmacao-exclusao-cartao">
              <p>Excluir este cartão permanentemente?</p>
              <button
                disabled={ocupado}
                onClick={() => definirConfirmandoExclusao(false)}
                type="button"
              >
                Manter cartão
              </button>
              <button disabled={ocupado} onClick={excluir} type="button">
                {excluindo ? "Excluindo..." : "Excluir cartão"}
              </button>
            </div>
          ) : (
            <>
              <button
                className="botao-excluir-cartao"
                disabled={ocupado}
                onClick={() => definirConfirmandoExclusao(true)}
                type="button"
              >
                <Trash2 size={14} />
                Excluir
              </button>
              <button
                className="botao-arquivar-cartao"
                disabled={ocupado}
                onClick={aoArquivar}
                type="button"
              >
                <Archive size={14} />
                Arquivar
              </button>
              <span />
              <button disabled={ocupado} onClick={aoFechar} type="button">
                Cancelar
              </button>
              <button
                disabled={ocupado || !titulo.trim()}
                onClick={salvar}
                type="button"
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
