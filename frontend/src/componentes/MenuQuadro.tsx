import { MoreHorizontal, Pencil, Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PropriedadesMenuQuadro {
  titulo: string;
  quantidadeListas: number;
  salvando: boolean;
  excluindo: boolean;
  erro: string;
  aoSalvar: (titulo: string) => Promise<unknown>;
  aoExcluir: () => Promise<unknown>;
}

export function MenuQuadro({
  titulo,
  quantidadeListas,
  salvando,
  excluindo,
  erro,
  aoSalvar,
  aoExcluir
}: PropriedadesMenuQuadro) {
  const [aberto, definirAberto] = useState(false);
  const [modo, definirModo] = useState<"menu" | "editar" | "excluir">("menu");
  const [novoTitulo, definirNovoTitulo] = useState(titulo);
  const ocupado = salvando || excluindo;

  const fechar = () => {
    definirAberto(false);
    definirModo("menu");
    definirNovoTitulo(titulo);
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
        aria-label="Gerenciar quadro"
        className="botao-menu-quadro"
        onClick={() => definirAberto(true)}
        type="button"
      >
        <MoreHorizontal size={18} />
      </button>
    );
  }

  return (
    <div className="menu-quadro">
      <header>
        <strong>
          {modo === "editar"
            ? "Renomear quadro"
            : modo === "excluir"
              ? "Excluir quadro"
              : "Opções do quadro"}
        </strong>
        <button aria-label="Fechar menu" disabled={ocupado} onClick={fechar}>
          <X size={15} />
        </button>
      </header>

      {modo === "menu" ? (
        <div>
          <button onClick={() => definirModo("editar")} type="button">
            <Pencil size={14} />
            Renomear quadro
          </button>
          <button onClick={() => definirModo("excluir")} type="button">
            <Trash2 size={14} />
            Excluir quadro
          </button>
        </div>
      ) : null}

      {modo === "editar" ? (
        <form onSubmit={salvar}>
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

      {modo === "excluir" ? (
        <section>
          <p>
            Esta ação remove permanentemente o quadro, suas{" "}
            <strong>
              {quantidadeListas}{" "}
              {quantidadeListas === 1 ? "lista" : "listas"}
            </strong>{" "}
            e todos os cartões.
          </p>
          <button disabled={ocupado} onClick={excluir} type="button">
            {excluindo ? "Excluindo..." : "Excluir permanentemente"}
          </button>
        </section>
      ) : null}

      {erro ? <p className="erro-menu-quadro">{erro}</p> : null}
    </div>
  );
}
