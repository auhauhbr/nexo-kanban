import type { PropsWithChildren } from "react";

import { ProductPreview } from "./ProductPreview";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="auth-shell">
      <ProductPreview />
      <section className="auth-panel">{children}</section>
    </main>
  );
}
