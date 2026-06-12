import { ArrowRight, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PropriedadesFormularioNovoQuadro {
  criando: boolean;
  erro: string;
  aoCriar: (titulo: string) => Promise<unknown>;
}

export function FormularioNovoQuadro({
  criando,
  erro,
  aoCriar
}: PropriedadesFormularioNovoQuadro) {
  const [aberto, definirAberto] = useState(false);
  const [titulo, definirTitulo] = useState("");

  const enviarFormulario = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!titulo.trim()) {
      return;
    }

    await aoCriar(titulo.trim());
    definirTitulo("");
    definirAberto(false);
  };

  if (!aberto) {
    return (
      <button
        className="botao-criar-quadro"
        onClick={() => definirAberto(true)}
        type="button"
      >
        <Plus size={18} />
        Novo quadro
      </button>
    );
  }

  return (
    <form className="formulario-novo-quadro" onSubmit={enviarFormulario}>
      <label htmlFor="titulo-novo-quadro">Nome do novo quadro</label>
      <div>
        <input
          autoFocus
          id="titulo-novo-quadro"
          maxLength={100}
          onChange={(evento) => definirTitulo(evento.target.value)}
          placeholder="Ex.: Planejamento do produto"
          value={titulo}
        />
        <button
          aria-label="Cancelar criação"
          className="botao-cancelar-criacao"
          disabled={criando}
          onClick={() => definirAberto(false)}
          type="button"
        >
          <X size={18} />
        </button>
        <button
          className="botao-confirmar-criacao"
          disabled={criando || !titulo.trim()}
          type="submit"
        >
          {criando ? "Criando..." : "Criar"}
          <ArrowRight size={17} />
        </button>
      </div>
      {erro ? <p>{erro}</p> : null}
    </form>
  );
}
