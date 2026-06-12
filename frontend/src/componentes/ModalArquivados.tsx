import { ArchiveRestore, X } from "lucide-react";
import { useState } from "react";

import type { ArquivadosQuadro, Lista } from "../tipos";

interface PropriedadesModalArquivados {
  arquivados: ArquivadosQuadro;
  listasAtivas: Lista[];
  ocupado: boolean;
  aoFechar: () => void;
  aoRestaurarLista: (idLista: string) => Promise<unknown>;
  aoRestaurarCartao: (idCartao: string, idLista?: string) => Promise<unknown>;
}

export function ModalArquivados({
  arquivados,
  listasAtivas,
  ocupado,
  aoFechar,
  aoRestaurarLista,
  aoRestaurarCartao
}: PropriedadesModalArquivados) {
  const [destinos, definirDestinos] = useState<Record<string, string>>({});

  return (
    <div aria-modal="true" className="fundo-modal" role="dialog">
      <div className="modal-arquivados">
        <header>
          <div>
            <span>Organização do quadro</span>
            <h2>Central de Arquivados</h2>
          </div>
          <button aria-label="Fechar arquivados" onClick={aoFechar} type="button">
            <X size={17} />
          </button>
        </header>

        <section>
          <h3>Listas arquivadas</h3>
          {arquivados.lists.length ? (
            arquivados.lists.map((lista) => (
              <article key={lista.id}>
                <div>
                  <strong>{lista.title}</strong>
                  <span>{lista._count.cards} cartões vinculados</span>
                </div>
                <button disabled={ocupado} onClick={() => aoRestaurarLista(lista.id)}>
                  <ArchiveRestore size={14} />
                  Restaurar
                </button>
              </article>
            ))
          ) : (
            <p>Nenhuma lista arquivada.</p>
          )}
        </section>

        <section>
          <h3>Cartões arquivados</h3>
          {arquivados.cards.length ? (
            arquivados.cards.map((cartao) => {
              const precisaDestino = cartao.list.archived;
              return (
                <article key={cartao.id}>
                  <div>
                    <strong>#{cartao.number || "—"} {cartao.title}</strong>
                    <span>Lista de origem: {cartao.list.title}</span>
                    {precisaDestino ? (
                      <select
                        aria-label={`Lista de destino para ${cartao.title}`}
                        onChange={(evento) =>
                          definirDestinos((atuais) => ({
                            ...atuais,
                            [cartao.id]: evento.target.value
                          }))
                        }
                        value={destinos[cartao.id] ?? ""}
                      >
                        <option value="">Escolha uma lista ativa</option>
                        {listasAtivas.map((lista) => (
                          <option key={lista.id} value={lista.id}>{lista.title}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                  <button
                    disabled={ocupado || (precisaDestino && !destinos[cartao.id])}
                    onClick={() => aoRestaurarCartao(cartao.id, destinos[cartao.id])}
                  >
                    <ArchiveRestore size={14} />
                    Restaurar
                  </button>
                </article>
              );
            })
          ) : (
            <p>Nenhum cartão arquivado.</p>
          )}
        </section>
      </div>
    </div>
  );
}
