import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Columns3 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import * as apiCartoes from "../api/cartoes";
import * as apiListas from "../api/listas";
import * as apiQuadros from "../api/quadros";
import { ColunaQuadro } from "../componentes/ColunaQuadro";
import { FormularioNovaLista } from "../componentes/FormularioNovaLista";
import { Marca } from "../componentes/Marca";
import { ModalEditarCartao } from "../componentes/ModalEditarCartao";
import type { Cartao, Quadro } from "../tipos";
import {
  moverCartaoNoQuadro,
  type MovimentoCartao
} from "../utilitarios/mover-cartao";

export function PaginaQuadro() {
  const { idQuadro = "" } = useParams();
  const clienteConsultas = useQueryClient();
  const chaveConsultaQuadro = ["quadro", idQuadro];
  const [cartaoSelecionado, definirCartaoSelecionado] = useState<{
    cartao: Cartao;
    nomeLista: string;
  } | null>(null);
  const [idCartaoArrastado, definirIdCartaoArrastado] = useState<string | null>(
    null
  );
  const consultaQuadro = useQuery({
    queryKey: chaveConsultaQuadro,
    queryFn: () => apiQuadros.buscarQuadro(idQuadro),
    enabled: Boolean(idQuadro)
  });
  const criacaoLista = useMutation({
    mutationFn: (titulo: string) => apiListas.criarLista({ idQuadro, titulo }),
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const edicaoLista = useMutation({
    mutationFn: apiListas.atualizarTituloLista,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const exclusaoLista = useMutation({
    mutationFn: apiListas.excluirLista,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const criacaoCartao = useMutation({
    mutationFn: apiCartoes.criarCartao,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const edicaoCartao = useMutation({
    mutationFn: apiCartoes.atualizarCartao,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const exclusaoCartao = useMutation({
    mutationFn: apiCartoes.excluirCartao,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
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
    },
    onSettled: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const mensagemErroCriacao = criacaoLista.error
    ? axios.isAxiosError(criacaoLista.error)
      ? (criacaoLista.error.response?.data?.message ??
        "Não foi possível criar a lista.")
      : "Não foi possível criar a lista."
    : "";
  const mensagemErroLista =
    edicaoLista.error || exclusaoLista.error
      ? axios.isAxiosError(edicaoLista.error ?? exclusaoLista.error)
        ? ((edicaoLista.error ?? exclusaoLista.error) as {
            response?: { data?: { message?: string } };
          }).response?.data?.message ?? "Não foi possível atualizar a lista."
        : "Não foi possível atualizar a lista."
      : "";
  const mensagemErroCartao = criacaoCartao.error
    ? axios.isAxiosError(criacaoCartao.error)
      ? (criacaoCartao.error.response?.data?.message ??
        "Não foi possível criar o cartão.")
      : "Não foi possível criar o cartão."
    : "";
  const mensagemErroEdicao = edicaoCartao.error
    ? axios.isAxiosError(edicaoCartao.error)
      ? (edicaoCartao.error.response?.data?.message ??
        "Não foi possível salvar o cartão.")
      : "Não foi possível salvar o cartão."
    : "";
  const mensagemErroExclusao = exclusaoCartao.error
    ? axios.isAxiosError(exclusaoCartao.error)
      ? (exclusaoCartao.error.response?.data?.message ??
        "Não foi possível excluir o cartão.")
      : "Não foi possível excluir o cartão."
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
        </div>
        {movimentacaoCartao.isError ? (
          <p className="erro-movimentacao">
            Não foi possível mover o cartão. A posição anterior foi restaurada.
          </p>
        ) : null}
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
            aoIniciarArraste={definirIdCartaoArrastado}
            aoExcluirLista={(idLista) => exclusaoLista.mutateAsync(idLista)}
            aoRenomearLista={(idLista, titulo) =>
              edicaoLista.mutateAsync({ idLista, titulo })
            }
            aoSoltarCartao={soltarCartao}
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
