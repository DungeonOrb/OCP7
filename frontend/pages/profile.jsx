import { parse } from "cookie";
import { useState } from "react";
import styles from "../styles/Profile.module.css";

export default function ProfilePage({ user, error: initialError }) {
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState(initialError || "");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const profileRes = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "profile",
          name,
          email,
        }),
      });

      const profileData = await profileRes.json().catch(() => ({}));

      if (!profileRes.ok) {
        throw new Error(
          profileData?.message || "Erreur lors de la mise à jour du profil"
        );
      }

      if (newPassword.trim()) {
        const passwordRes = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "password",
            currentPassword,
            newPassword,
          }),
        });

        const passwordData = await passwordRes.json().catch(() => ({}));

        if (!passwordRes.ok) {
          throw new Error(
            passwordData?.message ||
              "Erreur lors de la mise à jour du mot de passe"
          );
        }
      }

      setDisplayName(name);
      setSuccess("Informations mises à jour avec succès");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mon compte</h1>
          <p className={styles.subtitle}>{displayName || "Utilisateur"}</p>
        </div>

        {error ? <div className={styles.errorBox}>{error}</div> : null}
        {success ? <div className={styles.successBox}>{success}</div> : null}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Nom</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="currentPassword">Mot de passe actuel</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Mot de passe actuel"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Modifier les informations"}
          </button>
        </form>
      </section>
    </main>
  );
}

export async function getServerSideProps(context) {
  const cookies = parse(context.req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return {
      redirect: {
        destination: "/connexion",
        permanent: false,
      },
    };
  }

  const res = await fetch("http://localhost:8000/auth/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();

    return {
      props: {
        user: null,
        error: `Profile backend error (${res.status}): ${errorText}`,
      },
    };
  }

  const data = await res.json();

  return {
    props: {
      user: data?.data?.user || null,
      error: null,
    },
  };
}