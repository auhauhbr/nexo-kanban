import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Columns3 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as apiCartoes from "../api/cartoes";
import * as apiListas from "../api/listas";
import * as apiQuadros from "../api/quadros";
import { ColunaQuadro } from "../componentes/ColunaQuadro";
import { FormularioNovaLista } from "../componentes/FormularioNovaLista";
import { Marca } from "../componentes/Marca";
import { MenuQuadro } from "../componentes/MenuQuadro";
import { ModalEditarCartao } from "../componentes/ModalEditarCartao";
import { usarNotificacoes } from "../contexto/ContextoNotificacoes";
import { usarTempoRealQuadro } from "../hooks/usarTempoRealQuadro";
import type { Cartao, Quadro } from "../tipos";
import {
  moverCartaoNoQuadro,
  type MovimentoCartao
} from "../utilitarios/mover-cartao";
import {
  moverListaNoQuadro,
  type MovimentoLista
} from "../utilitarios/mover-lista";
import { obterMensagemErro } from "../utilitarios/mensagem-erro";

const rotulosTempoReal = {
  conectado: "Tempo real ativo",
  conectando: "Conectando...",
  desconectado: "Tempo real pausado",
  erro: "Tempo real indisponível"
};

export function PaginaQuadro() {
  const { idQuadro = "" } = useParams();
  const navegar = useNavigate();
  const clienteConsultas = useQueryClient();
  const { mostrarErro, mostrarSucesso } = usarNotificacoes();
  const chaveConsultaQuadro = ["quadro", idQuadro];
  const estadoTempoReal = usarTempoRealQuadro(idQuadro);
  const [cartaoSelecionado, definirCartaoSelecionado] = useState<{
    cartao: Cartao;
    nomeLista: string;
  } | null>(null);
  const [idCartaoArrastado, definirIdCartaoArrastado] = useState<string | null>(
    null
  );
  const [idListaArrastada, definirIdListaArrastada] = useState<string | null>(
    null
  );
  const consultaQuadro = useQuery({
    queryKey: chaveConsultaQuadro,
    queryFn: () => apiQuadros.buscarQuadro(idQuadro),
    enabled: Boolean(idQuadro)
  });
  const edicaoQuadro = useMutation({
    mutationFn: apiQuadros.atualizarTituloQuadro,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      clienteConsultas.invalidateQueries({ queryKey: ["quadros"] });
      mostrarSucesso("Nome do quadro atualizado.");
    }
  });
  const exclusaoQuadro = useMutation({
    mutationFn: apiQuadros.excluirQuadro,
    onSuccess: async () => {
      await clienteConsultas.invalidateQueries({ queryKey: ["quadros"] });
      mostrarSucesso("Quadro excluído.");
      navegar("/");
    }
  });
  const criacaoLista = useMutation({
    mutationFn: (titulo: string) => apiListas.criarLista({ idQuadro, titulo }),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Lista criada.");
    }
  });
  const edicaoLista = useMutation({
    mutationFn: apiListas.atualizarTituloLista,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Nome da lista atualizado.");
    }
  });
  const exclusaoLista = useMutation({
    mutationFn: apiListas.excluirLista,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Lista excluída.");
    }
  });
  const movimentacaoLista = useMutation({
    mutationFn: ({ idLista, posicaoDestino }: MovimentoLista) =>
      apiListas.moverLista({ idLista, posicao: posicaoDestino }),
    onMutate: async (movimento) => {
      await clienteConsultas.cancelQueries({ queryKey: chaveConsultaQuadro });
      const quadroAnterior = clienteConsultas.getQueryData<Quadro>(
        chaveConsultaQuadro
      );

      if (quadroAnterior) {
        clienteConsultas.setQueryData(
          chaveConsultaQuadro,
          moverListaNoQuadro(quadroAnterior, movimento)
        );
      }

      return { quadroAnterior };
    },
    onError: (_erro, _movimento, contexto) => {
      if (contexto?.quadroAnterior) {
        clienteConsultas.setQueryData(
          chaveConsultaQuadro,
          contexto.quadroAnterior
        );
      }
      mostrarErro("Não foi possível mover a lista. A posição foi restaurada.");
    },
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const criacaoCartao = useMutation({
    mutationFn: apiCartoes.criarCartao,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Cartão criado.");
    }
  });
  const edicaoCartao = useMutation({
    mutationFn: apiCartoes.atualizarCartao,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Cartão atualizado.");
    }
  });
  const exclusaoCartao = useMutation({
    mutationFn: apiCartoes.excluirCartao,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Cartão excluído.");
    }
  });
  const movimentacaoCartao = useMutation({
    mutationFn: ({ idCartao, idListaDestino, posicaoDestino }: MovimentoCartao) =>
      apiCartoes.moverCartao({
        idCartao,
        idLista: idListaDestino,
        posicao: posicaoDestino
      }),
    onMutate: async (movimento) => {
      await clienteConsultas.cancelQueries({ queryKey: chaveConsultaQuadro });
      const quadroAnterior = clienteConsultas.getQueryData<Quadro>(
        chaveConsultaQuadro
      );

      if (quadroAnterior) {
        clienteConsultas.setQueryData(
          chaveConsultaQuadro,
          moverCartaoNoQuadro(quadroAnterior, movimento)
        );
      }

      return { quadroAnterior };
    },
    onError: (_erro, _movimento, contexto) => {
      if (contexto?.quadroAnterior) {
        clienteConsultas.setQueryData(
          chaveConsultaQuadro,
          contexto.quadroAnterior
        );
      }
      mostrarErro("Não foi possível mover o cartão. A posição foi restaurada.");
    },
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const mensagemErroCriacao = criacaoLista.error
    ? obterMensagemErro(criacaoLista.error, "Não foi possível criar a lista.")
    : "";
  const mensagemErroQuadro =
    edicaoQuadro.error || exclusaoQuadro.error
      ? obterMensagemErro(
          edicaoQuadro.error ?? exclusaoQuadro.error,
          "Não foi possível atualizar o quadro."
        )
      : "";
  const mensagemErroLista =
    edicaoLista.error || exclusaoLista.error
      ? obterMensagemErro(
          edicaoLista.error ?? exclusaoLista.error,
          "Não foi possível atualizar a lista."
        )
      : "";
  const mensagemErroCartao = criacaoCartao.error
    ? obterMensagemErro(criacaoCartao.error, "Não foi possível criar o cartão.")
    : "";
  const mensagemErroEdicao = edicaoCartao.error
    ? obterMensagemErro(edicaoCartao.error, "Não foi possível salvar o cartão.")
    : "";
  const mensagemErroExclusao = exclusaoCartao.error
    ? obterMensagemErro(
        exclusaoCartao.error,
        "Não foi possível excluir o cartão."
      )
    : "";

  if (consultaQuadro.isPending) {
    return <div className="app-carregando">Carregando quadro...</div>;
  }

  if (consultaQuadro.isError) {
    return (
      <main className="erro-quadro">
        <p>Não foi possível carregar este quadro.</p>
        <Link to="/">Voltar aos quadros</Link>
      </main>
    );
  }

  const quadro = consultaQuadro.data;
  const soltarCartao = (idListaDestino: string, posicaoDestino: number) => {
    if (!idCartaoArrastado || movimentacaoCartao.isPending) {
      return;
    }

    movimentacaoCartao.mutate({
      idCartao: idCartaoArrastado,
      idListaDestino,
      posicaoDestino
    });
    definirIdCartaoArrastado(null);
  };
  const soltarLista = (posicaoDestino: number) => {
    if (!idListaArrastada || movimentacaoLista.isPending) {
      return;
    }

    movimentacaoLista.mutate({
      idLista: idListaArrastada,
      posicaoDestino
    });
    definirIdListaArrastada(null);
  };

  return (
    <main className="pagina-quadro">
      <header className="cabecalho-quadro">
        <Marca />
        <Link to="/">
          <ArrowLeft size={17} />
          Todos os quadros
        </Link>
      </header>

      <section className="barra-quadro">
        <div>
          <span>
            <Columns3 size={19} />
          </span>
          <div>
            <h1>{quadro.title}</h1>
            <p>
              {quadro.lists.length}{" "}
              {quadro.lists.length === 1 ? "lista" : "listas"}
            </p>
          </div>
          <MenuQuadro
            aoExcluir={() => exclusaoQuadro.mutateAsync(idQuadro)}
            aoSalvar={(titulo) =>
              edicaoQuadro.mutateAsync({ idQuadro, titulo })
            }
            erro={mensagemErroQuadro}
            excluindo={exclusaoQuadro.isPending}
            quantidadeListas={quadro.lists.length}
            salvando={edicaoQuadro.isPending}
            titulo={quadro.title}
          />
          <span
            className={`estado-tempo-real estado-tempo-real-${estadoTempoReal}`}
            title={`Tempo real: ${estadoTempoReal}`}
          >
            <i />
            {rotulosTempoReal[estadoTempoReal]}
          </span>
        </div>
      </section>

      <section className="area-listas">
        {quadro.lists.map((lista) => (
          <ColunaQuadro
            aoCriarCartao={(idLista, titulo, descricao) =>
              criacaoCartao.mutateAsync({ idLista, titulo, descricao })
            }
            aoSelecionarCartao={(cartao, nomeLista) =>
              definirCartaoSelecionado({ cartao, nomeLista })
            }
            aoFinalizarArraste={() => definirIdCartaoArrastado(null)}
            aoFinalizarArrasteLista={() => definirIdListaArrastada(null)}
            aoIniciarArraste={definirIdCartaoArrastado}
            aoIniciarArrasteLista={definirIdListaArrastada}
            aoExcluirLista={(idLista) => exclusaoLista.mutateAsync(idLista)}
            aoRenomearLista={(idLista, titulo) =>
              edicaoLista.mutateAsync({ idLista, titulo })
            }
            aoSoltarCartao={soltarCartao}
            aoSoltarLista={soltarLista}
            criandoCartao={
              criacaoCartao.isPending &&
              criacaoCartao.variables?.idLista === lista.id
            }
            erroCriacaoCartao={
              criacaoCartao.variables?.idLista === lista.id
                ? mensagemErroCartao
                : ""
            }
            erroLista={
              edicaoLista.variables?.idLista === lista.id ||
              exclusaoLista.variables === lista.id
                ? mensagemErroLista
                : ""
            }
            excluindoLista={
              exclusaoLista.isPending && exclusaoLista.variables === lista.id
            }
            key={lista.id}
            lista={lista}
            idCartaoArrastado={idCartaoArrastado}
            idListaArrastada={idListaArrastada}
            salvandoLista={
              edicaoLista.isPending && edicaoLista.variables?.idLista === lista.id
            }
          />
        ))}
        <FormularioNovaLista
          aoCriar={(titulo) => criacaoLista.mutateAsync(titulo)}
          criando={criacaoLista.isPending}
          erro={mensagemErroCriacao}
        />
      </section>

      {cartaoSelecionado ? (
        <ModalEditarCartao
          aoFechar={() => definirCartaoSelecionado(null)}
          aoExcluir={() =>
            exclusaoCartao.mutateAsync(cartaoSelecionado.cartao.id)
          }
          aoSalvar={(titulo, descricao) =>
            edicaoCartao.mutateAsync({
              idCartao: cartaoSelecionado.cartao.id,
              titulo,
              descricao
            })
          }
          cartao={cartaoSelecionado.cartao}
          erro={mensagemErroEdicao}
          erroExclusao={mensagemErroExclusao}
          excluindo={exclusaoCartao.isPending}
          nomeLista={cartaoSelecionado.nomeLista}
          salvando={edicaoCartao.isPending}
        />
      ) : null}
    </main>
  );
}
