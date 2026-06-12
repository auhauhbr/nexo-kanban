import type { PropsWithChildren } from "react";

import { PreviaProduto } from "./PreviaProduto";

export function LayoutAutenticacao({ children }: PropsWithChildren) {
  return (
    <main className="estrutura-autenticacao">
      <PreviaProduto />
      <section className="painel-autenticacao">{children}</section>
    </main>
  );
}
