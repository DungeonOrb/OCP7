import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await login({ email, password });

      const token =
        data?.data?.token || data?.token || data?.accessToken || null;

      if (!token) {
        throw new Error("Token introuvable dans la réponse");
      }

      localStorage.setItem("token", token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur de connexion");
    }
  }

  return (
    <div>
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: 400 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Se connecter</button>
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}