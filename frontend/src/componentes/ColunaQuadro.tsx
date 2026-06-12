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
}

export function ColunaQuadro({
  lista,
  criandoCartao,
  erroCriacaoCartao,
  aoCriarCartao,
  aoSelecionarCartao
}: PropriedadesColunaQuadro) {
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
            <button
              className="cartao-tarefa"
              key={cartao.id}
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
