import type { DragEvent } from "react";
import {
  CalendarDays,
  CheckSquare,
  GripVertical,
  MessageSquare,
  MoreHorizontal,
  Paperclip
} from "lucide-react";

import type { Cartao, Lista } from "../tipos";
import { FormularioNovoCartao } from "./FormularioNovoCartao";
import { MenuLista } from "./MenuLista";

interface PropriedadesColunaQuadro {
  lista: Lista;
  criandoCartao: boolean;
  erroCriacaoCartao: string;
  aoCriarCartao: (
    idLista: string,
    titulo: string,
    descricao?: string
  ) => Promise<unknown>;
  aoSelecionarCartao: (cartao: Cartao, nomeLista: string) => void;
  aoSoltarCartao: (idLista: string, posicao: number) => void;
  aoIniciarArraste: (idCartao: string) => void;
  aoFinalizarArraste: () => void;
  idCartaoArrastado: string | null;
  salvandoLista: boolean;
  excluindoLista: boolean;
  erroLista: string;
  aoRenomearLista: (idLista: string, titulo: string) => Promise<unknown>;
  aoExcluirLista: (idLista: string) => Promise<unknown>;
  aoArquivarLista: (idLista: string) => Promise<unknown>;
  aoDefinirLimiteLista: (idLista: string, limite: number | null) => Promise<unknown>;
  aoIniciarArrasteLista: (idLista: string) => void;
  aoFinalizarArrasteLista: () => void;
  aoSoltarLista: (posicao: number) => void;
  idListaArrastada: string | null;
}

export function ColunaQuadro({
  lista,
  criandoCartao,
  erroCriacaoCartao,
  aoCriarCartao,
  aoSelecionarCartao,
  aoSoltarCartao,
  aoIniciarArraste,
  aoFinalizarArraste,
  idCartaoArrastado,
  salvandoLista,
  excluindoLista,
  erroLista,
  aoRenomearLista,
  aoExcluirLista,
  aoArquivarLista,
  aoDefinirLimiteLista,
  aoIniciarArrasteLista,
  aoFinalizarArrasteLista,
  aoSoltarLista,
  idListaArrastada
}: PropriedadesColunaQuadro) {
  const permitirSoltar = (evento: DragEvent) => evento.preventDefault();
  const formatarPrazo = (prazo: string) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
      new Date(prazo)
    );
  const classePrazo = (prazo: string) => {
    const diferenca = new Date(prazo).getTime() - Date.now();
    if (diferenca < 0) return "prazo-atrasado";
    if (diferenca <= 3 * 24 * 60 * 60 * 1000) return "prazo-proximo";
    return "prazo-normal";
  };

  return (
    <section
      className={`coluna-quadro ${
        idCartaoArrastado ? "coluna-alvo-arraste" : ""
      } ${idListaArrastada === lista.id ? "lista-arrastando" : ""} ${
        idListaArrastada && idListaArrastada !== lista.id
          ? "lista-alvo-arraste"
          : ""
      } ${lista.wipLimit !== null && lista.cards.length > lista.wipLimit ? "lista-acima-limite" : ""}`}
      onDragOver={permitirSoltar}
      onDrop={(evento) => {
        evento.preventDefault();
        if (idListaArrastada) {
          aoSoltarLista(lista.position);
        } else {
          aoSoltarCartao(lista.id, lista.cards.length);
        }
      }}
    >
      <header>
        <button
          aria-label={`Arrastar lista ${lista.title}`}
          className="alca-lista"
          draggable
          onDragEnd={aoFinalizarArrasteLista}
          onDragStart={(evento) => {
            evento.dataTransfer.effectAllowed = "move";
            evento.dataTransfer.setData("text/plain", lista.id);
            aoIniciarArrasteLista(lista.id);
          }}
          type="button"
        >
          <GripVertical size={15} />
        </button>
        <div className="cabecalho-titulo-lista">
          <h2>{lista.title}</h2>
          <span>
            {lista.cards.length}
            {lista.wipLimit !== null ? `/${lista.wipLimit}` : ""}
          </span>
        </div>
        <MenuLista
          aoArquivar={() => aoArquivarLista(lista.id)}
          aoExcluir={() => aoExcluirLista(lista.id)}
          aoDefinirLimite={(limite) => aoDefinirLimiteLista(lista.id, limite)}
          aoSalvar={(titulo) => aoRenomearLista(lista.id, titulo)}
          erro={erroLista}
          excluindo={excluindoLista}
          quantidadeCartoes={lista.cards.length}
          limite={lista.wipLimit}
          salvando={salvandoLista}
          titulo={lista.title}
        />
      </header>

      <div className="cartoes-coluna">
        {lista.cards.length === 0 ? (
          <p className="lista-sem-cartoes">Nenhum cartão nesta lista.</p>
        ) : (
          lista.cards.map((cartao) => (
            <button
              className={`cartao-tarefa ${
                idCartaoArrastado === cartao.id ? "cartao-arrastando" : ""
              }`}
              draggable={!idListaArrastada}
              key={cartao.id}
              onDragEnd={aoFinalizarArraste}
              onDragOver={permitirSoltar}
              onDragStart={(evento) => {
                evento.dataTransfer.effectAllowed = "move";
                evento.dataTransfer.setData("text/plain", cartao.id);
                aoIniciarArraste(cartao.id);
              }}
              onDrop={(evento) => {
                evento.preventDefault();
                evento.stopPropagation();
                if (idListaArrastada) {
                  aoSoltarLista(lista.position);
                } else {
                  aoSoltarCartao(lista.id, cartao.position);
                }
              }}
              onClick={() => aoSelecionarCartao(cartao, lista.title)}
              type="button"
            >
              {cartao.coverColor ? (
                <span
                  aria-hidden="true"
                  className="capa-cartao"
                  style={{ background: cartao.coverColor }}
                />
              ) : null}
              {cartao.labels.length ? (
                <div className="etiquetas-cartao">
                  {cartao.labels.map((etiqueta) => (
                    <span
                      key={etiqueta.id}
                      style={{ background: etiqueta.color }}
                      title={etiqueta.name}
                    />
                  ))}
                </div>
              ) : null}
              <div className="titulo-cartao-tarefa">
                <span>#{cartao.number || "—"}</span>
                <h3>{cartao.title}</h3>
                <MoreHorizontal aria-hidden="true" size={15} />
              </div>
              {cartao.description ? <p>{cartao.description}</p> : null}
              {cartao.dueDate ||
              cartao.checklists.length ||
              cartao.attachments.length ||
              cartao.activities.some((atividade) => atividade.type === "comment") ? (
                <div className="metadados-cartao">
                  {cartao.dueDate ? (
                    <span
                      className={classePrazo(cartao.dueDate)}
                    >
                      <CalendarDays size={12} />
                      {formatarPrazo(cartao.dueDate)}
                    </span>
                  ) : null}
                  {cartao.checklists.length ? (
                    <span>
                      <CheckSquare size={12} />
                      {cartao.checklists.reduce(
                        (total, checklist) =>
                          total + checklist.items.filter((item) => item.done).length,
                        0
                      )}
                      /
                      {cartao.checklists.reduce(
                        (total, checklist) => total + checklist.items.length,
                        0
                      )}
                    </span>
                  ) : null}
                  {cartao.attachments.length ? (
                    <span>
                      <Paperclip size={12} />
                      {cartao.attachments.length}
                    </span>
                  ) : null}
                  {cartao.activities.some((atividade) => atividade.type === "comment") ? (
                    <span>
                      <MessageSquare size={12} />
                      {cartao.activities.filter((atividade) => atividade.type === "comment").length}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </button>
          ))
        )}
      </div>
      <FormularioNovoCartao
        aoCriar={(titulo, descricao) =>
          aoCriarCartao(lista.id, titulo, descricao)
        }
        criando={criandoCartao}
        erro={erroCriacaoCartao}
      />
    </section>
  );
}
