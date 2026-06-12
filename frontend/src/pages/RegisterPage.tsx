import axios from "axios";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      await signUp(name, email, password);
      navigate("/");
    } catch (requestError) {
      setError(
        axios.isAxiosError(requestError)
          ? (requestError.response?.data?.message ?? "Não foi possível criar a conta.")
          : "Não foi possível criar a conta."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <header>
          <h1>Crie sua conta</h1>
          <p>Comece seu primeiro quadro e transforme planos em progresso.</p>
        </header>

        <label htmlFor="register-name">
          Nome
          <input
            autoComplete="name"
            id="register-name"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Seu nome"
            required
            value={name}
          />
        </label>

        <label htmlFor="register-email">
          E-mail
          <input
            autoComplete="email"
            id="register-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="seu@email.com"
            required
            type="email"
            value={email}
          />
        </label>

        <label htmlFor="register-password">
          Senha
          <span className="password-field">
            <input
              autoComplete="new-password"
              id="register-password"
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
          <small>Mínimo de 8 caracteres.</small>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={submitting} type="submit">
          {submitting ? "Criando..." : "Criar conta"}
          <ArrowRight size={19} />
        </button>

        <p className="auth-switch">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
