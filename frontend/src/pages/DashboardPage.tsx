import { LogOut } from "lucide-react";

import { Brand } from "../components/Brand";
import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { signOut, user } = useAuth();

  return (
    <main className="dashboard-placeholder">
      <header>
        <Brand />
        <button onClick={signOut} type="button">
          <LogOut size={17} />
          Sair
        </button>
      </header>
      <section>
        <h1>Olá, {user?.name}.</h1>
        <p>Sua conta está conectada. Os quadros chegam na próxima etapa.</p>
      </section>
    </main>
  );
}
