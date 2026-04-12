import { parse } from "cookie";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaListUl,
  FaColumns,
  FaFolder,
  FaCalendarAlt,
  FaCommentAlt,
  FaSearch,
} from "react-icons/fa";
import styles from "../styles/Dashboard.module.css";

function formatDueDate(dateString) {
  if (!dateString) return "Sans date";
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Sans date";

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function getStatusLabel(status) {
  switch (status) {
    case "TODO":
      return "À faire";
    case "IN_PROGRESS":
      return "En cours";
    case "DONE":
      return "Terminée";
    default:
      return status || "Inconnu";
  }
}

function getStatusClass(status, styles) {
  switch (status) {
    case "TODO":
      return styles.statusTodo;
    case "IN_PROGRESS":
      return styles.statusInProgress;
    case "DONE":
      return styles.statusDone;
    default:
      return "";
  }
}

export default function DashboardPage({ profileName, tasks, error }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("list");
  const [search, setSearch] = useState("");

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/connexion");
  }

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;

    return tasks.filter((task) => {
      const title = (task.name || task.title || "").toLowerCase();
      const description = (task.description || "").toLowerCase();
      const projectName = (task.project?.name || "").toLowerCase();

      return (
        title.includes(q) ||
        description.includes(q) ||
        projectName.includes(q)
      );
    });
  }, [tasks, search]);

  const kanbanColumns = useMemo(() => {
    return {
      TODO: filteredTasks.filter((task) => task.status === "TODO"),
      IN_PROGRESS: filteredTasks.filter((task) => task.status === "IN_PROGRESS"),
      DONE: filteredTasks.filter((task) => task.status === "DONE"),
    };
  }, [filteredTasks]);

  function renderTaskCard(task) {
    return (
      <article key={task.id} className={styles.card}>
        <div className={styles.cardMain}>
          <div>
            <h3 className={styles.cardTitle}>
              {task.name || task.title || "Nom de la tâche"}
            </h3>
            <p className={styles.cardDescription}>
              {task.description || "Description de la tâche"}
            </p>
          </div>

          <span
            className={`${styles.statusBadge} ${getStatusClass(
              task.status,
              styles
            )}`}
          >
            {getStatusLabel(task.status)}
          </span>
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <FaFolder />
              <span>{task.project?.name || "Nom du projet"}</span>
            </span>

            <span className={styles.metaItem}>
              <FaCalendarAlt />
              <span>{formatDueDate(task.dueDate)}</span>
            </span>

            <span className={styles.metaItem}>
              <FaCommentAlt />
              <span>{task.comments?.length || 0}</span>
            </span>
          </div>

          <Link
            href={`/projects/${task.projectId || task.project?.id}`}
            className={styles.viewButton}
          >
            Voir
          </Link>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.errorBox}>{error}</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.topRow}>
        <div>
          <h1 className={styles.title}>Tableau de bord</h1>
          <p className={styles.subtitle}>
            Bonjour {profileName || "utilisateur"}, voici un aperçu de vos
            projets et tâches
          </p>
        </div>

        <button className={styles.createButton} type="button">
          + Créer un projet
        </button>
      </section>

      <section className={styles.switchRow}>
        <button
          type="button"
          className={`${styles.switchButton} ${
            viewMode === "list" ? styles.switchActive : ""
          }`}
          onClick={() => setViewMode("list")}
        >
          <FaListUl />
          <span>Liste</span>
        </button>

        <button
          type="button"
          className={`${styles.switchButton} ${
            viewMode === "kanban" ? styles.switchActive : ""
          }`}
          onClick={() => setViewMode("kanban")}
        >
          <FaColumns />
          <span>Kanban</span>
        </button>
      </section>

      {viewMode === "list" ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>Mes tâches assignées</h2>
              <p className={styles.panelSubtitle}>Par ordre de priorité</p>
            </div>

            <label className={styles.searchBox}>
              <input
                type="text"
                placeholder="Rechercher une tâche"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className={styles.searchIcon} />
            </label>
          </div>

          <div className={styles.cards}>
            {filteredTasks.length === 0 ? (
              <div className={styles.emptyState}>
                Aucune tâche assignée trouvée.
              </div>
            ) : (
              filteredTasks.map(renderTaskCard)
            )}
          </div>
        </section>
      ) : (
        <section className={styles.kanbanGrid}>
          <div className={styles.kanbanColumn}>
            <div className={styles.kanbanHeader}>
              <h2>À faire</h2>
              <span className={styles.countBadge}>
                {kanbanColumns.TODO.length}
              </span>
            </div>
            <div className={styles.kanbanCards}>
              {kanbanColumns.TODO.map(renderTaskCard)}
            </div>
          </div>

          <div className={styles.kanbanColumn}>
            <div className={styles.kanbanHeader}>
              <h2>En cours</h2>
              <span className={styles.countBadge}>
                {kanbanColumns.IN_PROGRESS.length}
              </span>
            </div>
            <div className={styles.kanbanCards}>
              {kanbanColumns.IN_PROGRESS.map(renderTaskCard)}
            </div>
          </div>

          <div className={styles.kanbanColumn}>
            <div className={styles.kanbanHeader}>
              <h2>Terminées</h2>
              <span className={styles.countBadge}>
                {kanbanColumns.DONE.length}
              </span>
            </div>
            <div className={styles.kanbanCards}>
              {kanbanColumns.DONE.map(renderTaskCard)}
            </div>
          </div>
        </section>
      )}
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

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [profileRes, tasksRes] = await Promise.all([
    fetch("http://localhost:8000/auth/profile", { headers }),
    fetch("http://localhost:8000/dashboard/assigned-tasks", { headers }),
  ]);

  if (!profileRes.ok || !tasksRes.ok) {
    const errors = await Promise.all([profileRes.text(), tasksRes.text()]);

    return {
      props: {
        profileName: null,
        tasks: [],
        error:
          `profile: ${profileRes.status} ${errors[0]}\n` +
          `assigned-tasks: ${tasksRes.status} ${errors[1]}`,
      },
    };
  }

  const [profileData, tasksData] = await Promise.all([
    profileRes.json(),
    tasksRes.json(),
  ]);

  return {
    props: {
      profileName: profileData?.data?.user?.name || "",
      tasks: tasksData?.data?.tasks || [],
      error: null,
    },
  };
}