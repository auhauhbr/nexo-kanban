import type { DragEvent } from "react";
import { GripVertical } from "lucide-react";

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
  aoIniciarArrasteLista,
  aoFinalizarArrasteLista,
  aoSoltarLista,
  idListaArrastada
}: PropriedadesColunaQuadro) {
  const permitirSoltar = (evento: DragEvent) => evento.preventDefault();

  return (
    <section
      className={`coluna-quadro ${
        idCartaoArrastado ? "coluna-alvo-arraste" : ""
      } ${idListaArrastada === lista.id ? "lista-arrastando" : ""} ${
        idListaArrastada && idListaArrastada !== lista.id
          ? "lista-alvo-arraste"
          : ""
      }`}
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
        <div>
          <h2>{lista.title}</h2>
          <span>{lista.cards.length}</span>
        </div>
        <MenuLista
          aoExcluir={() => aoExcluirLista(lista.id)}
          aoSalvar={(titulo) => aoRenomearLista(lista.id, titulo)}
          erro={erroLista}
          excluindo={excluindoLista}
          quantidadeCartoes={lista.cards.length}
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
              <h3>{cartao.title}</h3>
              {cartao.description ? <p>{cartao.description}</p> : null}
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
