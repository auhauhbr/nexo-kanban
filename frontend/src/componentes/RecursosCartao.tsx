import { CheckSquare, Palette, Plus, Tag, Trash2 } from "lucide-react";
import { useState, type CSSProperties, type FormEvent } from "react";

import type { Cartao, Etiqueta } from "../tipos";

interface PropriedadesRecursosCartao {
  cartao: Cartao;
  etiquetasQuadro: Etiqueta[];
  ocupado: boolean;
  aoCriarEtiqueta: (nome: string, cor: string) => Promise<unknown>;
  aoAlternarEtiqueta: (idEtiqueta: string, vinculada: boolean) => Promise<unknown>;
  aoExcluirEtiqueta: (idEtiqueta: string) => Promise<unknown>;
  aoCriarChecklist: (titulo: string) => Promise<unknown>;
  aoExcluirChecklist: (idChecklist: string) => Promise<unknown>;
  aoCriarItem: (idChecklist: string, texto: string) => Promise<unknown>;
  aoAlternarItem: (idItem: string, concluido: boolean) => Promise<unknown>;
  aoExcluirItem: (idItem: string) => Promise<unknown>;
  aoAlterarCapa: (cor: string | null) => Promise<unknown>;
}

const cores = ["#165dff", "#ff6b4a", "#27ae60", "#8b5cf6", "#d59c00", "#d92d20"];

export function RecursosCartao({
  cartao,
  etiquetasQuadro,
  ocupado,
  aoCriarEtiqueta,
  aoAlternarEtiqueta,
  aoExcluirEtiqueta,
  aoCriarChecklist,
  aoExcluirChecklist,
  aoCriarItem,
  aoAlternarItem,
  aoExcluirItem,
  aoAlterarCapa
}: PropriedadesRecursosCartao) {
  const [nomeEtiqueta, definirNomeEtiqueta] = useState("");
  const [corEtiqueta, definirCorEtiqueta] = useState(cores[0]);
  const [tituloChecklist, definirTituloChecklist] = useState("");
  const [novosItens, definirNovosItens] = useState<Record<string, string>>({});
  const idsEtiquetas = new Set(cartao.labels.map((etiqueta) => etiqueta.id));

  const criarEtiqueta = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!nomeEtiqueta.trim()) return;
    await aoCriarEtiqueta(nomeEtiqueta.trim(), corEtiqueta);
    definirNomeEtiqueta("");
  };

  const criarChecklist = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!tituloChecklist.trim()) return;
    await aoCriarChecklist(tituloChecklist.trim());
    definirTituloChecklist("");
  };

  return (
    <div className="recursos-cartao">
      <section className="secao-recurso-cartao">
        <header>
          <Palette size={15} />
          <strong>Capa do cartão</strong>
        </header>
        <div className="paleta-capa-cartao">
          {cores.map((cor) => (
            <button
              aria-label={`Usar capa ${cor}`}
              className={cartao.coverColor === cor ? "capa-selecionada" : ""}
              disabled={ocupado}
              key={cor}
              onClick={() => aoAlterarCapa(cor)}
              style={{ background: cor }}
              type="button"
            />
          ))}
          <button
            className="remover-capa"
            disabled={ocupado || !cartao.coverColor}
            onClick={() => aoAlterarCapa(null)}
            type="button"
          >
            Remover
          </button>
        </div>
      </section>

      <section className="secao-recurso-cartao">
        <header>
          <Tag size={15} />
          <strong>Etiquetas</strong>
        </header>
        <div className="lista-etiquetas-modal">
          {etiquetasQuadro.map((etiqueta) => {
            const vinculada = idsEtiquetas.has(etiqueta.id);
            return (
              <div className="linha-etiqueta-modal" key={etiqueta.id}>
                <button
                  className={vinculada ? "etiqueta-selecionada" : ""}
                  disabled={ocupado}
                  onClick={() => aoAlternarEtiqueta(etiqueta.id, vinculada)}
                  style={{ "--cor-etiqueta": etiqueta.color } as CSSProperties}
                  type="button"
                >
                  <span />
                  {etiqueta.name}
                </button>
                <button
                  aria-label={`Excluir etiqueta ${etiqueta.name}`}
                  disabled={ocupado}
                  onClick={() => aoExcluirEtiqueta(etiqueta.id)}
                  type="button"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
        <form className="formulario-recurso" onSubmit={criarEtiqueta}>
          <input
            maxLength={40}
            onChange={(evento) => definirNomeEtiqueta(evento.target.value)}
            placeholder="Nova etiqueta"
            value={nomeEtiqueta}
          />
          <select
            aria-label="Cor da etiqueta"
            onChange={(evento) => definirCorEtiqueta(evento.target.value)}
            style={{ background: corEtiqueta }}
            value={corEtiqueta}
          >
            {cores.map((cor) => (
              <option key={cor} style={{ background: cor }} value={cor}>
                {cor}
              </option>
            ))}
          </select>
          <button disabled={ocupado || !nomeEtiqueta.trim()} type="submit">
            <Plus size={14} />
          </button>
        </form>
      </section>

      <section className="secao-recurso-cartao">
        <header>
          <CheckSquare size={15} />
          <strong>Checklists</strong>
        </header>
        {cartao.checklists.map((checklist) => {
          const concluidos = checklist.items.filter((item) => item.done).length;
          const progresso = checklist.items.length
            ? Math.round((concluidos / checklist.items.length) * 100)
            : 0;
          return (
            <div className="checklist-modal" key={checklist.id}>
              <div className="cabecalho-checklist-modal">
                <strong>{checklist.title}</strong>
                <span>{concluidos}/{checklist.items.length}</span>
                <button
                  aria-label={`Excluir checklist ${checklist.title}`}
                  disabled={ocupado}
                  onClick={() => aoExcluirChecklist(checklist.id)}
                  type="button"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="progresso-checklist">
                <span style={{ width: `${progresso}%` }} />
              </div>
              <div className="itens-checklist">
                {checklist.items.map((item) => (
                  <div key={item.id}>
                    <input
                      checked={item.done}
                      disabled={ocupado}
                      onChange={() => aoAlternarItem(item.id, item.done)}
                      type="checkbox"
                    />
                    <span className={item.done ? "item-concluido" : ""}>{item.text}</span>
                    <button
                      aria-label={`Excluir item ${item.text}`}
                      disabled={ocupado}
                      onClick={() => aoExcluirItem(item.id)}
                      type="button"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <form
                className="formulario-recurso formulario-item-checklist"
                onSubmit={async (evento) => {
                  evento.preventDefault();
                  const texto = novosItens[checklist.id]?.trim();
                  if (!texto) return;
                  await aoCriarItem(checklist.id, texto);
                  definirNovosItens((atuais) => ({ ...atuais, [checklist.id]: "" }));
                }}
              >
                <input
                  maxLength={300}
                  onChange={(evento) =>
                    definirNovosItens((atuais) => ({
                      ...atuais,
                      [checklist.id]: evento.target.value
                    }))
                  }
                  placeholder="Adicionar item"
                  value={novosItens[checklist.id] ?? ""}
                />
                <button disabled={ocupado || !novosItens[checklist.id]?.trim()} type="submit">
                  <Plus size={14} />
                </button>
              </form>
            </div>
          );
        })}
        <form className="formulario-recurso" onSubmit={criarChecklist}>
          <input
            maxLength={100}
            onChange={(evento) => definirTituloChecklist(evento.target.value)}
            placeholder="Novo checklist"
            value={tituloChecklist}
          />
          <button disabled={ocupado || !tituloChecklist.trim()} type="submit">
            <Plus size={14} />
          </button>
        </form>
      </section>
    </div>
  );
}
