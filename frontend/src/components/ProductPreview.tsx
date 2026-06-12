import { CheckCircle2, Clock3, Database, PanelsTopLeft } from "lucide-react";

import { Brand } from "./Brand";

const columns = [
  {
    title: "Ideias",
    cards: [
      { title: "Página de autenticação", meta: "UI/UX", tone: "blue" },
      { title: "Integração com API", meta: "Back-end", tone: "green" }
    ]
  },
  {
    title: "Em andamento",
    cards: [
      { title: "Quadro Kanban", meta: "Front-end", tone: "green" },
      { title: "Notificações em tempo real", meta: "Socket.io", tone: "coral" }
    ]
  },
  {
    title: "Concluído",
    cards: [
      { title: "Configurar repositório", meta: "DevOps", tone: "violet" },
      { title: "Modelagem do banco", meta: "Prisma", tone: "green" }
    ]
  }
];

export function ProductPreview() {
  return (
    <section className="product-preview">
      <Brand />
      <div className="preview-copy">
        <h2>Seu trabalho, do início ao fim.</h2>
        <p>
          Quadros Kanban simples e poderosos para você focar no que realmente
          importa.
        </p>
      </div>

      <div className="preview-board" aria-label="Prévia de um quadro Kanban">
        <div className="preview-board-header">
          <PanelsTopLeft size={16} />
          <strong>Projeto Website</strong>
          <span>Visão geral</span>
        </div>
        <div className="preview-columns">
          {columns.map((column) => (
            <div className="preview-column" key={column.title}>
              <div className="preview-column-title">
                <span>{column.title}</span>
                <span>{column.cards.length}</span>
              </div>
              {column.cards.map((card) => (
                <article className="preview-card" key={card.title}>
                  <strong>{card.title}</strong>
                  <span className={`preview-tag ${card.tone}`}>{card.meta}</span>
                  <span className="preview-person">
                    <span>TN</span>
                    Tadeu
                    {column.title === "Concluído" ? (
                      <CheckCircle2 size={14} />
                    ) : null}
                  </span>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="preview-benefits">
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
