import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";

interface PropriedadesFormularioNovoCartao {
  criando: boolean;
  erro: string;
  aoCriar: (titulo: string, descricao?: string) => Promise<unknown>;
}

export function FormularioNovoCartao({
  criando,
  erro,
  aoCriar
}: PropriedadesFormularioNovoCartao) {
  const [aberto, definirAberto] = useState(false);
  const [titulo, definirTitulo] = useState("");
  const [descricao, definirDescricao] = useState("");

  const fechar = () => {
    definirAberto(false);
    definirTitulo("");
    definirDescricao("");
  };

  const enviarFormulario = async (evento: FormEvent) => {
    evento.preventDefault();

    if (!titulo.trim()) {
      return;
    }

    try {
      await aoCriar(titulo.trim(), descricao.trim() || undefined);
      fechar();
    } catch {
      // A mensagem da mutação permanece visível no formulário.
    }
  };

  if (!aberto) {
    return (
      <button
        className="botao-adicionar-cartao"
        onClick={() => definirAberto(true)}
        type="button"
      >
        <Plus size={15} />
        Adicionar cartão
      </button>
    );
  }

  return (
    <form className="formulario-novo-cartao" onSubmit={enviarFormulario}>
      <input
        autoFocus
        maxLength={200}
        onChange={(evento) => definirTitulo(evento.target.value)}
        placeholder="Título do cartão"
        value={titulo}
      />
      <textarea
        maxLength={5000}
        onChange={(evento) => definirDescricao(evento.target.value)}
        placeholder="Descrição opcional"
        rows={3}
        value={descricao}
      />
      <div>
        <button disabled={criando || !titulo.trim()} type="submit">
          {criando ? "Criando..." : "Criar cartão"}
        </button>
        <button
          aria-label="Cancelar criação do cartão"
          disabled={criando}
          onClick={fechar}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
      {erro ? <p>{erro}</p> : null}
    </form>
  );
}
