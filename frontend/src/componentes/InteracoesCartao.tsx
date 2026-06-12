import { ExternalLink, Link, MessageSquare, Paperclip, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { Cartao } from "../tipos";

interface PropriedadesInteracoesCartao {
  cartao: Cartao;
  ocupado: boolean;
  aoComentar: (mensagem: string) => Promise<unknown>;
  aoAnexarLink: (titulo: string, url: string) => Promise<unknown>;
  aoExcluirAnexo: (idAnexo: string) => Promise<unknown>;
}

const formatarData = (data: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(data));

export function InteracoesCartao({
  cartao,
  ocupado,
  aoComentar,
  aoAnexarLink,
  aoExcluirAnexo
}: PropriedadesInteracoesCartao) {
  const [comentario, definirComentario] = useState("");
  const [tituloAnexo, definirTituloAnexo] = useState("");
  const [urlAnexo, definirUrlAnexo] = useState("");

  const comentar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!comentario.trim()) return;
    await aoComentar(comentario.trim());
    definirComentario("");
  };

  const anexar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!tituloAnexo.trim() || !urlAnexo.trim()) return;
    await aoAnexarLink(tituloAnexo.trim(), urlAnexo.trim());
    definirTituloAnexo("");
    definirUrlAnexo("");
  };

  return (
    <aside className="interacoes-cartao">
      <section>
        <header>
          <Paperclip size={15} />
          <strong>Anexos por link</strong>
        </header>
        <div className="lista-anexos-cartao">
          {cartao.attachments.length ? (
            cartao.attachments.map((anexo) => (
              <div key={anexo.id}>
                <a href={anexo.url} rel="noreferrer" target="_blank">
                  <ExternalLink size={13} />
                  <span>{anexo.title}</span>
                </a>
                <button
                  aria-label={`Excluir anexo ${anexo.title}`}
                  disabled={ocupado}
                  onClick={() => aoExcluirAnexo(anexo.id)}
                  type="button"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <p>Nenhum link anexado.</p>
          )}
        </div>
        <form className="formulario-anexo" onSubmit={anexar}>
          <input
            maxLength={120}
            onChange={(evento) => definirTituloAnexo(evento.target.value)}
            placeholder="Nome do anexo"
            value={tituloAnexo}
          />
          <div>
            <input
              onChange={(evento) => definirUrlAnexo(evento.target.value)}
              placeholder="https://..."
              type="url"
              value={urlAnexo}
            />
            <button
              disabled={ocupado || !tituloAnexo.trim() || !urlAnexo.trim()}
              title="Anexar link"
              type="submit"
            >
              <Plus size={14} />
            </button>
          </div>
        </form>
      </section>

      <section className="secao-atividade-cartao">
        <header>
          <MessageSquare size={15} />
          <strong>Comentários e atividade</strong>
        </header>
        <form className="formulario-comentario" onSubmit={comentar}>
          <textarea
            maxLength={2000}
            onChange={(evento) => definirComentario(evento.target.value)}
            placeholder="Escreva um comentário..."
            rows={3}
            value={comentario}
          />
          <button disabled={ocupado || !comentario.trim()} type="submit">
            Comentar
          </button>
        </form>
        <div className="linha-do-tempo-cartao">
          {cartao.activities.length ? (
            cartao.activities.map((atividade) => (
              <article key={atividade.id}>
                <span aria-hidden="true">{atividade.user.name.slice(0, 1).toUpperCase()}</span>
                <div>
                  <p>
                    <strong>{atividade.user.name}</strong>{" "}
                    {atividade.type === "comment" ? "comentou:" : atividade.message}
                  </p>
                  {atividade.type === "comment" ? (
                    <blockquote>{atividade.message}</blockquote>
                  ) : null}
                  <time dateTime={atividade.createdAt}>{formatarData(atividade.createdAt)}</time>
                </div>
              </article>
            ))
          ) : (
            <p className="atividade-vazia">Nenhuma atividade registrada.</p>
          )}
        </div>
      </section>
    </aside>
  );
}
