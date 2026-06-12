import type { DragEvent } from "react";

import type { Cartao, Lista } from "../tipos";
import { FormularioNovoCartao } from "./FormularioNovoCartao";

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
  idCartaoArrastado
}: PropriedadesColunaQuadro) {
  const permitirSoltar = (evento: DragEvent) => evento.preventDefault();

  return (
    <section
      className={`coluna-quadro ${
        idCartaoArrastado ? "coluna-alvo-arraste" : ""
      }`}
      onDragOver={permitirSoltar}
      onDrop={(evento) => {
        evento.preventDefault();
        aoSoltarCartao(lista.id, lista.cards.length);
      }}
    >
      <header>
        <div>
          <h2>{lista.title}</h2>
          <span>{lista.cards.length}</span>
        </div>
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
              draggable
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
                aoSoltarCartao(lista.id, cartao.position);
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
