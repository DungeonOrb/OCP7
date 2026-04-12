import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Inscription.module.css";

export default function InscriptionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors de l'inscription");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    }
  }

  return (
    <div className={styles.inscriptionPage}>
      <div className={styles.inscriptionLeft}>
        <div className={styles.inscriptionContent}>
          <div className={styles.inscriptionLogo}>ABRICOT</div>

          <h1 className={styles.inscriptionTitle}>Inscription</h1>

          <form onSubmit={handleSubmit} className={styles.inscriptionForm}>
            <div className={styles.formGroup}>
              <label>Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <button type="submit" className={styles.registerButton}>
              S'inscrire
            </button>

            {error && <p className={styles.errorMessage}>{error}</p>}
          </form>

          <p className={styles.signinText}>
            Déjà inscrit ? <a href="/connexion">Se connecter</a>
          </p>
        </div>
      </div>

      <div className={styles.inscriptionRight}>
        <img
          src="/inscription.png"
          alt="Espace de travail"
          className={styles.inscriptionImage}
        />
      </div>
    </div>
  );
}