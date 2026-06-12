import { Archive, Gauge, MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PropriedadesMenuLista {
  titulo: string;
  quantidadeCartoes: number;
  limite: number | null;
  salvando: boolean;
  excluindo: boolean;
  erro: string;
  aoSalvar: (titulo: string) => Promise<unknown>;
  aoExcluir: () => Promise<unknown>;
  aoArquivar: () => Promise<unknown>;
  aoDefinirLimite: (limite: number | null) => Promise<unknown>;
}

export function MenuLista({
  titulo,
  quantidadeCartoes,
  limite,
  salvando,
  excluindo,
  erro,
  aoSalvar,
  aoExcluir,
  aoArquivar,
  aoDefinirLimite
}: PropriedadesMenuLista) {
  const [aberto, definirAberto] = useState(false);
  const [modo, definirModo] = useState<"menu" | "editar" | "limite" | "excluir">("menu");
  const [novoTitulo, definirNovoTitulo] = useState(titulo);
  const [novoLimite, definirNovoLimite] = useState(limite?.toString() ?? "");
  const ocupado = salvando || excluindo;

  const fechar = () => {
    definirAberto(false);
    definirModo("menu");
    definirNovoTitulo(titulo);
    definirNovoLimite(limite?.toString() ?? "");
  };

  const salvar = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!novoTitulo.trim()) {
      return;
    }

    try {
      await aoSalvar(novoTitulo.trim());
      fechar();
    } catch {
      // A mensagem da mutação permanece visível.
    }
  };

  const excluir = async () => {
    try {
      await aoExcluir();
      fechar();
    } catch {
      // A mensagem da mutação permanece visível.
    }
  };

  if (!aberto) {
    return (
      <button
        aria-label={`Gerenciar lista ${titulo}`}
        className="botao-menu-lista"
        onClick={() => definirAberto(true)}
        type="button"
      >
        <MoreHorizontal size={17} />
      </button>
    );
  }

  return (
    <div className="menu-lista">
      <header>
        <strong>
          {modo === "editar"
            ? "Renomear lista"
            : modo === "excluir"
              ? "Excluir lista"
              : modo === "limite"
                ? "Limite de cartões"
              : "Opções da lista"}
        </strong>
        <button aria-label="Fechar menu" disabled={ocupado} onClick={fechar}>
          <X size={15} />
        </button>
      </header>

      {modo === "menu" ? (
        <div className="acoes-menu-lista">
          <button onClick={() => definirModo("editar")} type="button">
            <Pencil size={14} />
            Renomear lista
          </button>
          <button
            onClick={() => definirModo("limite")}
            type="button"
          >
            <Gauge size={14} />
            Definir limite de cartões
          </button>
          <button
            disabled={ocupado}
            onClick={async () => {
              await aoArquivar();
              fechar();
            }}
            type="button"
          >
            <Archive size={14} />
            Arquivar lista
          </button>
          <button onClick={() => definirModo("excluir")} type="button">
            <Trash2 size={14} />
            Excluir lista
          </button>
        </div>
      ) : null}

      {modo === "editar" ? (
        <form className="edicao-lista" onSubmit={salvar}>
          <input
            autoFocus
            maxLength={100}
            onChange={(evento) => definirNovoTitulo(evento.target.value)}
            value={novoTitulo}
          />
          <button disabled={ocupado || !novoTitulo.trim()} type="submit">
            {salvando ? "Salvando..." : "Salvar nome"}
          </button>
        </form>
      ) : null}

      {modo === "limite" ? (
        <form
          className="edicao-lista"
          onSubmit={async (evento) => {
            evento.preventDefault();
            await aoDefinirLimite(novoLimite ? Number(novoLimite) : null);
            fechar();
          }}
        >
          <p className="texto-limite-lista">
            O limite alerta sobre excesso de trabalho, mas não impede movimentações.
          </p>
          <input
            autoFocus
            min="1"
            onChange={(evento) => definirNovoLimite(evento.target.value)}
            placeholder="Sem limite"
            type="number"
            value={novoLimite}
          />
          <button disabled={ocupado} type="submit">
            {novoLimite ? "Salvar limite" : "Remover limite"}
          </button>
        </form>
      ) : null}

      {modo === "excluir" ? (
        <div className="exclusao-lista">
          <p>
            Esta ação remove a lista e{" "}
            <strong>
              {quantidadeCartoes}{" "}
              {quantidadeCartoes === 1 ? "cartão" : "cartões"}
            </strong>
            .
          </p>
          <button disabled={ocupado} onClick={excluir} type="button">
            {excluindo ? "Excluindo..." : "Excluir permanentemente"}
          </button>
        </div>
      ) : null}

      {erro ? <p className="erro-menu-lista">{erro}</p> : null}
    </div>
  );
}
