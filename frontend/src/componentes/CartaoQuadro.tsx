import { Columns3 } from "lucide-react";
import { Link } from "react-router-dom";

import type { ResumoQuadro } from "../tipos";

interface PropriedadesCartaoQuadro {
  quadro: ResumoQuadro;
}

const formatarData = (data: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(data));

export function CartaoQuadro({ quadro }: PropriedadesCartaoQuadro) {
  const quantidadeListas = quadro._count?.lists ?? 0;

  return (
    <Link className="cartao-quadro" to={`/quadros/${quadro.id}`}>
      <div className="icone-cartao-quadro">
        <Columns3 size={22} />
      </div>
      <div className="conteudo-cartao-quadro">
        <h2>{quadro.title}</h2>
        <p>
          {quantidadeListas} {quantidadeListas === 1 ? "lista" : "listas"}
        </p>
      </div>
      <div className="rodape-cartao-quadro">
        <span>Atualizado em {formatarData(quadro.updatedAt)}</span>
      </div>
    </Link>
  );
}
