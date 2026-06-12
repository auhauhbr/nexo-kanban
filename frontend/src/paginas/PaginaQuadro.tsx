import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArrowLeft, Columns3, Wifi } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as apiCartoes from "../api/cartoes";
import * as apiChecklists from "../api/checklists";
import * as apiEtiquetas from "../api/etiquetas";
import * as apiInteracoes from "../api/interacoes";
import * as apiListas from "../api/listas";
import * as apiQuadros from "../api/quadros";
import { ColunaQuadro } from "../componentes/ColunaQuadro";
import { FormularioNovaLista } from "../componentes/FormularioNovaLista";
import { Marca } from "../componentes/Marca";
import { MenuQuadro } from "../componentes/MenuQuadro";
import { ModalArquivados } from "../componentes/ModalArquivados";
import { ModalEditarCartao } from "../componentes/ModalEditarCartao";
import { usarNotificacoes } from "../contexto/ContextoNotificacoes";
import { usarTempoRealQuadro } from "../hooks/usarTempoRealQuadro";
import type { Quadro } from "../tipos";
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
    idCartao: string;
    nomeLista: string;
  } | null>(null);
  const [idCartaoArrastado, definirIdCartaoArrastado] = useState<string | null>(
    null
  );
  const [idListaArrastada, definirIdListaArrastada] = useState<string | null>(
    null
  );
  const [arquivadosAbertos, definirArquivadosAbertos] = useState(false);
  const consultaQuadro = useQuery({
    queryKey: chaveConsultaQuadro,
    queryFn: () => apiQuadros.buscarQuadro(idQuadro),
    enabled: Boolean(idQuadro)
  });
  const consultaArquivados = useQuery({
    queryKey: ["arquivados", idQuadro],
    queryFn: () => apiQuadros.buscarArquivados(idQuadro),
    enabled: Boolean(idQuadro && arquivadosAbertos)
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
  const arquivamentoLista = useMutation({
    mutationFn: apiListas.arquivarLista,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Lista arquivada.");
    }
  });
  const limiteLista = useMutation({
    mutationFn: apiListas.definirLimiteLista,
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      mostrarSucesso("Limite da lista atualizado.");
    }
  });
  const restauracaoArquivados = useMutation({
    mutationFn: async (acao: () => Promise<unknown>) => acao(),
    onSuccess: () => {
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro });
      clienteConsultas.invalidateQueries({ queryKey: ["arquivados", idQuadro] });
      mostrarSucesso("Item restaurado.");
    },
    onError: (erro) =>
      mostrarErro(obterMensagemErro(erro, "Não foi possível restaurar o item."))
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
  const recursosCartao = useMutation({
    mutationFn: async (acao: () => Promise<unknown>) => acao(),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro }),
    onError: (erro) =>
      mostrarErro(
        obterMensagemErro(erro, "Não foi possível atualizar os recursos do cartão.")
      )
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
    edicaoLista.error || exclusaoLista.error || arquivamentoLista.error || limiteLista.error
      ? obterMensagemErro(
          edicaoLista.error ?? exclusaoLista.error ?? arquivamentoLista.error ?? limiteLista.error,
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
  const cartaoAberto = cartaoSelecionado
    ? quadro.lists
        .flatMap((lista) => lista.cards)
        .find((cartao) => cartao.id === cartaoSelecionado.idCartao)
    : undefined;
  const quantidadeCartoes = quadro.lists.reduce(
    (total, lista) => total + lista.cards.length,
    0
  );
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
        <div className="conteudo-barra-quadro">
          <span className="icone-titulo-quadro">
            <Columns3 size={19} />
          </span>
          <div className="titulo-quadro">
            <h1>{quadro.title}</h1>
            <p>
              {quadro.lists.length}{" "}
              {quadro.lists.length === 1 ? "lista" : "listas"}
              <i aria-hidden="true" />
              {quantidadeCartoes}{" "}
              {quantidadeCartoes === 1 ? "cartão" : "cartões"}
            </p>
          </div>
          <div className="acoes-quadro">
            <button
              className="botao-arquivados-quadro"
              onClick={() => definirArquivadosAbertos(true)}
              type="button"
            >
              <Archive size={14} />
              Arquivados
            </button>
            <span
              className={`estado-tempo-real estado-tempo-real-${estadoTempoReal}`}
              title={`Tempo real: ${estadoTempoReal}`}
            >
              <Wifi aria-hidden="true" size={14} />
              <span>{rotulosTempoReal[estadoTempoReal]}</span>
            </span>
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
          </div>
        </div>
      </section>

      <section className="area-listas">
        {quadro.lists.map((lista) => (
          <ColunaQuadro
            aoCriarCartao={(idLista, titulo, descricao) =>
              criacaoCartao.mutateAsync({ idLista, titulo, descricao })
            }
            aoSelecionarCartao={(cartao, nomeLista) =>
              definirCartaoSelecionado({ idCartao: cartao.id, nomeLista })
            }
            aoFinalizarArraste={() => definirIdCartaoArrastado(null)}
            aoFinalizarArrasteLista={() => definirIdListaArrastada(null)}
            aoIniciarArraste={definirIdCartaoArrastado}
            aoIniciarArrasteLista={definirIdListaArrastada}
            aoExcluirLista={(idLista) => exclusaoLista.mutateAsync(idLista)}
            aoArquivarLista={(idLista) => arquivamentoLista.mutateAsync(idLista)}
            aoDefinirLimiteLista={(idLista, limite) =>
              limiteLista.mutateAsync({ idLista, limite })
            }
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
              || arquivamentoLista.variables === lista.id
              || limiteLista.variables?.idLista === lista.id
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

      {cartaoSelecionado && cartaoAberto ? (
        <ModalEditarCartao
          aoAlterarCapa={(cor) =>
            recursosCartao.mutateAsync(() =>
              apiCartoes.atualizarRecursosCartao({
                idCartao: cartaoAberto.id,
                capa: cor
              })
            )
          }
          aoAnexarLink={(titulo, url) =>
            recursosCartao.mutateAsync(() =>
              apiInteracoes.anexarLink({ idCartao: cartaoAberto.id, titulo, url })
            )
          }
          aoArquivar={async () => {
            await recursosCartao.mutateAsync(() =>
              apiCartoes.atualizarRecursosCartao({
                idCartao: cartaoAberto.id,
                arquivado: true
              })
            );
            definirCartaoSelecionado(null);
            mostrarSucesso("Cartão arquivado.");
          }}
          aoAlternarEtiqueta={(idEtiqueta, vinculada) =>
            recursosCartao.mutateAsync(() =>
              vinculada
                ? apiEtiquetas.desvincularEtiqueta({
                    idCartao: cartaoAberto.id,
                    idEtiqueta
                  })
                : apiEtiquetas.vincularEtiqueta({
                    idCartao: cartaoAberto.id,
                    idEtiqueta
                  })
            )
          }
          aoAlternarItem={(idItem, concluido) =>
            recursosCartao.mutateAsync(() =>
              apiChecklists.atualizarItem({ idItem, concluido: !concluido })
            )
          }
          aoCriarChecklist={(titulo) =>
            recursosCartao.mutateAsync(() =>
              apiChecklists.criarChecklist({
                idCartao: cartaoAberto.id,
                titulo
              })
            )
          }
          aoCriarEtiqueta={(nome, cor) =>
            recursosCartao.mutateAsync(() =>
              apiEtiquetas.criarEtiqueta({ idQuadro, nome, cor })
            )
          }
          aoCriarItem={(idChecklist, texto) =>
            recursosCartao.mutateAsync(() =>
              apiChecklists.criarItem({ idChecklist, texto })
            )
          }
          aoComentar={(mensagem) =>
            recursosCartao.mutateAsync(() =>
              apiInteracoes.comentar({ idCartao: cartaoAberto.id, mensagem })
            )
          }
          aoExcluirChecklist={(idChecklist) =>
            recursosCartao.mutateAsync(() =>
              apiChecklists.excluirChecklist(idChecklist)
            )
          }
          aoExcluirEtiqueta={(idEtiqueta) =>
            recursosCartao.mutateAsync(() =>
              apiEtiquetas.excluirEtiqueta(idEtiqueta)
            )
          }
          aoExcluirItem={(idItem) =>
            recursosCartao.mutateAsync(() => apiChecklists.excluirItem(idItem))
          }
          aoExcluirAnexo={(idAnexo) =>
            recursosCartao.mutateAsync(() => apiInteracoes.excluirAnexo(idAnexo))
          }
          aoFechar={() => definirCartaoSelecionado(null)}
          aoExcluir={() => exclusaoCartao.mutateAsync(cartaoAberto.id)}
          aoSalvar={(titulo, descricao, prazo) =>
            edicaoCartao.mutateAsync({
              idCartao: cartaoAberto.id,
              titulo,
              descricao,
              prazo
            })
          }
          cartao={cartaoAberto}
          etiquetasQuadro={quadro.labels}
          erro={mensagemErroEdicao}
          erroExclusao={mensagemErroExclusao}
          excluindo={exclusaoCartao.isPending}
          nomeLista={cartaoSelecionado.nomeLista}
          salvando={edicaoCartao.isPending || recursosCartao.isPending}
        />
      ) : null}

      {arquivadosAbertos && consultaArquivados.data ? (
        <ModalArquivados
          aoFechar={() => definirArquivadosAbertos(false)}
          aoRestaurarCartao={(idCartao, idLista) =>
            restauracaoArquivados.mutateAsync(() =>
              apiCartoes.restaurarCartao({ idCartao, idLista })
            )
          }
          aoRestaurarLista={(idLista) =>
            restauracaoArquivados.mutateAsync(() => apiListas.restaurarLista(idLista))
          }
          arquivados={consultaArquivados.data}
          listasAtivas={quadro.lists}
          ocupado={restauracaoArquivados.isPending}
        />
      ) : null}
    </main>
  );
}
