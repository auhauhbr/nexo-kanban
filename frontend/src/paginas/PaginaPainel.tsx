import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutGrid, LogOut } from "lucide-react";

import * as apiQuadros from "../api/quadros";
import { CartaoQuadro } from "../componentes/CartaoQuadro";
import { FormularioNovoQuadro } from "../componentes/FormularioNovoQuadro";
import { Marca } from "../componentes/Marca";
import { usarAutenticacao } from "../contexto/ContextoAutenticacao";
import { obterMensagemErro } from "../utilitarios/mensagem-erro";

const chaveConsultaQuadros = ["quadros"];

export function PaginaPainel() {
  const { sair, usuario } = usarAutenticacao();
  const clienteConsultas = useQueryClient();
  const consultaQuadros = useQuery({
    queryKey: chaveConsultaQuadros,
    queryFn: apiQuadros.listarQuadros
  });
  const criacaoQuadro = useMutation({
    mutationFn: apiQuadros.criarQuadro,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadros })
  });

  const mensagemErroCriacao = criacaoQuadro.error
    ? obterMensagemErro(criacaoQuadro.error, "Não foi possível criar o quadro.")
    : "";

  return (
    <main className="painel-quadros">
      <header className="cabecalho-painel">
        <Marca />
        <div className="usuario-painel">
          <span>{usuario?.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{usuario?.name}</strong>
            <small>{usuario?.email}</small>
          </div>
          <button aria-label="Sair da conta" onClick={sair} type="button">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <section className="conteudo-painel">
        <div className="titulo-painel">
          <div>
            <h1>Seus quadros</h1>
            <p>Organize o trabalho e acompanhe cada etapa dos seus projetos.</p>
          </div>
          <FormularioNovoQuadro
            aoCriar={(titulo) => criacaoQuadro.mutateAsync(titulo)}
            criando={criacaoQuadro.isPending}
            erro={mensagemErroCriacao}
          />
        </div>

        {consultaQuadros.isPending ? (
          <div className="estado-painel">Carregando seus quadros...</div>
        ) : consultaQuadros.isError ? (
          <div className="estado-painel estado-painel-erro">
            <p>Não foi possível carregar os quadros.</p>
            <button onClick={() => consultaQuadros.refetch()} type="button">
              Tentar novamente
            </button>
          </div>
        ) : consultaQuadros.data.length === 0 ? (
          <div className="estado-painel estado-painel-vazio">
            <span>
              <LayoutGrid size={28} />
            </span>
            <h2>Seu primeiro quadro começa aqui</h2>
            <p>Crie um quadro para organizar listas, cartões e prioridades.</p>
          </div>
        ) : (
          <div className="grade-quadros">
            {consultaQuadros.data.map((quadro) => (
              <CartaoQuadro key={quadro.id} quadro={quadro} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
