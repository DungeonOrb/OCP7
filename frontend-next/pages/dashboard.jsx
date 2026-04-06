import { parse } from "cookie";
import { useRouter } from "next/router";

export default function DashboardPage({ dashboardData, error }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/connexion");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Déconnexion</button>

      {error ? (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>
      ) : (
        <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
      )}
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

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [statsRes, tasksRes, projectsRes] = await Promise.all([
    fetch("http://localhost:8000/dashboard/stats", { headers }),
    fetch("http://localhost:8000/dashboard/assigned-tasks", { headers }),
    fetch("http://localhost:8000/dashboard/projects-with-tasks", { headers }),
  ]);

  const statsText = await statsRes.text();
  const tasksText = await tasksRes.text();
  const projectsText = await projectsRes.text();

  if (!statsRes.ok || !tasksRes.ok || !projectsRes.ok) {
    return {
      props: {
        dashboardData: null,
        error:
          `stats: ${statsRes.status} ${statsText}\n\n` +
          `assigned-tasks: ${tasksRes.status} ${tasksText}\n\n` +
          `projects-with-tasks: ${projectsRes.status} ${projectsText}`,
      },
    };
  }

  return {
    props: {
      dashboardData: {
        stats: JSON.parse(statsText),
        assignedTasks: JSON.parse(tasksText),
        projectsWithTasks: JSON.parse(projectsText),
      },
      error: null,
    },
  };
}