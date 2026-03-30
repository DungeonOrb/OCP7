import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import "./Connexion.css";

export default function Connexion() {
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
      navigate("/Dashboard");
    } catch (error) {
  console.error("Erreur lors de la connexion:", error);
  return res.status(500).json({
    success: false,
    message: "Erreur lors de la connexion",
    error: error instanceof Error ? error.message : String(error),
  });
}
  }

  return (
    <div className="connexion-page">
      <div className="connexion-left">
        <div className="connexion-content">
          <div className="connexion-logo">ABRICOT</div>

          <h1>Connexion</h1>

          <form onSubmit={handleSubmit} className="connexion-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="login-button">
              Se connecter
            </button>
          </form>

          {error && <p className="error-message">{error}</p>}
        </div>
      </div>

      <div className="connexion-right">
        <img src="/src/assets/img/connexion.png" alt="Espace de travail" />
      </div>
    </div>
  );
}