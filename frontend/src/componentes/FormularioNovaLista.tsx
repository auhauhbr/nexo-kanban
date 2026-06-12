import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PropriedadesFormularioNovaLista {
  criando: boolean;
  erro: string;
  aoCriar: (titulo: string) => Promise<unknown>;
}

export function FormularioNovaLista({
  criando,
  erro,
  aoCriar
}: PropriedadesFormularioNovaLista) {
  const [aberto, definirAberto] = useState(false);
  const [titulo, definirTitulo] = useState("");

  const enviarFormulario = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!titulo.trim()) {
      return;
    }

    try {
      await aoCriar(titulo.trim());
      definirTitulo("");
      definirAberto(false);
    } catch {
      // A mensagem da mutação permanece visível no formulário.
    }
  };

  if (!aberto) {
    return (
      <button
        className="botao-adicionar-lista"
        onClick={() => definirAberto(true)}
        type="button"
      >
        <Plus size={18} />
        Adicionar lista
      </button>
    );
  }

  return (
    <form className="formulario-nova-lista" onSubmit={enviarFormulario}>
      <input
        autoFocus
        maxLength={100}
        onChange={(evento) => definirTitulo(evento.target.value)}
        placeholder="Nome da lista"
        value={titulo}
      />
      <div>
        <button disabled={criando || !titulo.trim()} type="submit">
          {criando ? "Adicionando..." : "Adicionar lista"}
        </button>
        <button
          aria-label="Cancelar criação da lista"
          disabled={criando}
          onClick={() => definirAberto(false)}
          type="button"
        >
          <X size={18} />
        </button>
      </div>
      {erro ? <p>{erro}</p> : null}
    </form>
  );
}
