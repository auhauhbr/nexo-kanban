import axios from "axios";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ?? "Não foi possível entrar.")
          : "Não foi possível entrar."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <header>
          <h1>Entre na sua conta</h1>
          <p>
            Organize projetos, acompanhe o progresso e mantenha tudo em
            movimento.
          </p>
        </header>

        <label htmlFor="login-email">
          E-mail
          <input
            autoComplete="email"
            id="login-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label htmlFor="login-password">
          Senha
          <span className="password-field">
            <input
              autoComplete="current-password"
              id="login-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Entrando..." : "Entrar"}
          <ArrowRight size={19} />
        </button>

        <p className="auth-switch">
          Ainda não tem uma conta? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
