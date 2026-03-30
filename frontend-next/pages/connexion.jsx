import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Connexion.module.css";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("alice@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de la connexion");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion");
    }
  }

  return (
    <div className={styles.connexionPage}>
      <div className={styles.connexionLeft}>
        <div className={styles.connexionContent}>
          <div className={styles.connexionLogo}>ABRICOT</div>

          <h1 className={styles.connexionTitle}>Connexion</h1>

          <form onSubmit={handleSubmit} className={styles.connexionForm}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.loginButton}>
              Se connecter
            </button>

            {error && <p className={styles.errorMessage}>{error}</p>}
          </form>

          <p className={styles.signupText}>
            Pas encore de compte ? <a href="#">Créer un compte</a>
          </p>
        </div>
      </div>

      <div className={styles.connexionRight}>
        <img
          src="/connexion.png"
          alt="Espace de travail"
          className={styles.connexionImage}
        />
      </div>
    </div>
  );
}