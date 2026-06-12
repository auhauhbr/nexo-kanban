import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Columns3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import * as apiCartoes from "../api/cartoes";
import * as apiListas from "../api/listas";
import * as apiQuadros from "../api/quadros";
import { ColunaQuadro } from "../componentes/ColunaQuadro";
import { FormularioNovaLista } from "../componentes/FormularioNovaLista";
import { Marca } from "../componentes/Marca";

export function PaginaQuadro() {
  const { idQuadro = "" } = useParams();
  const clienteConsultas = useQueryClient();
  const chaveConsultaQuadro = ["quadro", idQuadro];
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
  const criacaoCartao = useMutation({
    mutationFn: apiCartoes.criarCartao,
    onSuccess: () =>
      clienteConsultas.invalidateQueries({ queryKey: chaveConsultaQuadro })
  });
  const mensagemErroCriacao = criacaoLista.error
    ? axios.isAxiosError(criacaoLista.error)
      ? (criacaoLista.error.response?.data?.message ??
        "Não foi possível criar a lista.")
      : "Não foi possível criar a lista."
    : "";
  const mensagemErroCartao = criacaoCartao.error
    ? axios.isAxiosError(criacaoCartao.error)
      ? (criacaoCartao.error.response?.data?.message ??
        "Não foi possível criar o cartão.")
      : "Não foi possível criar o cartão."
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
      </section>

      <section className="area-listas">
        {quadro.lists.map((lista) => (
          <ColunaQuadro
            aoCriarCartao={(idLista, titulo, descricao) =>
              criacaoCartao.mutateAsync({ idLista, titulo, descricao })
            }
            criandoCartao={
              criacaoCartao.isPending &&
              criacaoCartao.variables?.idLista === lista.id
            }
            erroCriacaoCartao={
              criacaoCartao.variables?.idLista === lista.id
                ? mensagemErroCartao
                : ""
            }
            key={lista.id}
            lista={lista}
          />
        ))}
        <FormularioNovaLista
          aoCriar={(titulo) => criacaoLista.mutateAsync(titulo)}
          criando={criacaoLista.isPending}
          erro={mensagemErroCriacao}
        />
      </section>
    </main>
  );
}
