import type { Lista } from "../tipos";

interface PropriedadesColunaQuadro {
  lista: Lista;
}

export function ColunaQuadro({ lista }: PropriedadesColunaQuadro) {
  return (
    <section className="coluna-quadro">
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
            <article className="cartao-tarefa" key={cartao.id}>
              <h3>{cartao.title}</h3>
              {cartao.description ? <p>{cartao.description}</p> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
