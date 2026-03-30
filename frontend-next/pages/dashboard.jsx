import { parse } from "cookie";
import { useRouter } from "next/router";
import styles from "../styles/Connexion.module.css";

export default function DashboardPage({ dashboardData }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/connexion");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Déconnexion
        </button>
      </header>

      <pre className={styles.card}>
        {JSON.stringify(dashboardData, null, 2)}
      </pre>
    </div>
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

  const backendRes = await fetch("http://localhost:8000/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!backendRes.ok) {
    return {
      redirect: {
        destination: "/connexion",
        permanent: false,
      },
    };
  }

  const dashboardData = await backendRes.json();

  return {
    props: {
      dashboardData,
    },
  };
}