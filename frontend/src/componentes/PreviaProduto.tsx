import { CheckCircle2, Clock3, Database, PanelsTopLeft } from "lucide-react";

import { Marca } from "./Marca";

const colunas = [
  {
    titulo: "Ideias",
    cartoes: [
      { titulo: "Página de autenticação", categoria: "UI/UX", tom: "azul" },
      { titulo: "Integração com API", categoria: "Back-end", tom: "verde" }
    ]
  },
  {
    titulo: "Em andamento",
    cartoes: [
      { titulo: "Quadro Kanban", categoria: "Front-end", tom: "verde" },
      { titulo: "Notificações em tempo real", categoria: "Socket.io", tom: "coral" }
    ]
  },
  {
    titulo: "Concluído",
    cartoes: [
      { titulo: "Configurar repositório", categoria: "DevOps", tom: "violeta" },
      { titulo: "Modelagem do banco", categoria: "Prisma", tom: "verde" }
    ]
  }
];

export function PreviaProduto() {
  return (
    <section className="previa-produto">
      <Marca />
      <div className="texto-previa">
        <h2>Seu trabalho, do início ao fim.</h2>
        <p>
          Quadros Kanban simples e poderosos para você focar no que realmente
          importa.
        </p>
      </div>

      <div className="quadro-previa" aria-label="Prévia de um quadro Kanban">
        <div className="cabecalho-quadro-previa">
          <PanelsTopLeft size={16} />
          <strong>Projeto Website</strong>
          <span>Visão geral</span>
        </div>
        <div className="colunas-previa">
          {colunas.map((coluna) => (
            <div className="coluna-previa" key={coluna.titulo}>
              <div className="titulo-coluna-previa">
                <span>{coluna.titulo}</span>
                <span>{coluna.cartoes.length}</span>
              </div>
              {coluna.cartoes.map((cartao) => (
                <article className="cartao-previa" key={cartao.titulo}>
                  <strong>{cartao.titulo}</strong>
                  <span className={`etiqueta-previa ${cartao.tom}`}>
                    {cartao.categoria}
                  </span>
                  <span className="pessoa-previa">
                    <span>TN</span>
                    Tadeu
                    {coluna.titulo === "Concluído" ? (
                      <CheckCircle2 size={14} />
                    ) : null}
                  </span>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="beneficios-previa">
        <span>
          <Clock3 size={18} /> Mais velocidade
        </span>
        <span>
          <Database size={18} /> Dados seguros
        </span>
      </div>
    </section>
  );
}
