import { parse } from "cookie";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
    ArrowLeft,
    CheckSquare,
    CalendarDays,
    Search,
    ChevronDown,
    MoreHorizontal,
} from "lucide-react";
import styles from "../../styles/ProjectDetails.module.css";
import EditProjectModal from "../../components/EditProjectModal";

function getInitials(name) {
    if (!name || !name.trim()) return "??";

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
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

function formatDueDate(dateString) {
    if (!dateString) return "Sans date";
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "Sans date";

    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
    }).format(date);
}

export default function ProjectDetailsPage({ project, error }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(project);
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    if (error) {
        return (
            <main className={styles.page}>
                <div className={styles.errorBox}>{error}</div>
            </main>
        );
    }

    if (!project) {
        return (
            <main className={styles.page}>
                <div className={styles.errorBox}>Projet introuvable.</div>
            </main>
        );
    }

    const members = [
        ...(project.owner
            ? [
                {
                    id: project.owner.id,
                    name: project.owner.name || project.owner.email,
                    role: "Propriétaire",
                },
            ]
            : []),
        ...(project.members || []).map((member) => ({
            id: member.user.id,
            name: member.user.name || member.user.email,
            role: member.role === "ADMIN" ? "Admin" : "Contributeur",
        })),
    ];

    const filteredTasks = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return (project.tasks || []).filter((task) => {
            const taskName = (task.title || "").toLowerCase();

            const matchesSearch =
                !normalizedSearch || taskName.includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "ALL" || task.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [project.tasks, search, statusFilter]);

    return (
        <main className={styles.page}>
            <section className={styles.topBar}>
                <div className={styles.titleBlock}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.backButton}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>
                                {project.name || "Nom du projet"}
                            </h1>
                            <button
                                type="button"
                                className={styles.editLink}
                                onClick={() => setIsEditOpen(true)}
                            >
                                Modifier
                            </button>
                        </div>

                        <p className={styles.subtitle}>
                            {project.description || "Aucune description"}
                        </p>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" className={styles.darkButton}>
                        Créer une tâche
                    </button>
                    <button type="button" className={styles.orangeButton}>
                        ✦ IA
                    </button>
                </div>
            </section>

            <section className={styles.membersBar}>
                <div className={styles.membersTitle}>
                    <span>Contributeurs</span>
                    <span className={styles.membersCount}>
                        {members.length} personnes
                    </span>
                </div>

                <div className={styles.membersList}>
                    {members.map((member) => (
                        <div
                            key={`${member.id}-${member.role}`}
                            className={styles.memberChip}
                        >
                            <span className={styles.avatar}>{getInitials(member.name)}</span>
                            <span
                                className={
                                    member.role === "Propriétaire"
                                        ? styles.ownerBadge
                                        : styles.memberName
                                }
                            >
                                {member.role === "Propriétaire" ? member.role : member.name}
                            </span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={styles.tasksPanel}>
                <div className={styles.tasksHeader}>
                    <div>
                        <h2 className={styles.tasksTitle}>Tâches</h2>
                        <p className={styles.tasksSubtitle}>Par ordre de priorité</p>
                    </div>

                    <div className={styles.tasksControls}>
                        <button
                            type="button"
                            className={`${styles.viewButton} ${styles.viewActive}`}
                        >
                            <CheckSquare size={15} />
                            <span>Liste</span>
                        </button>

                        <button type="button" className={styles.viewButton}>
                            <CalendarDays size={15} />
                            <span>Calendrier</span>
                        </button>

                        <div className={styles.selectWrapper}>
                            <select
                                className={styles.filterSelect}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">Statut</option>
                                <option value="TODO">À faire</option>
                                <option value="IN_PROGRESS">En cours</option>
                                <option value="DONE">Terminée</option>
                            </select>
                            <ChevronDown size={15} className={styles.selectIcon} />
                        </div>

                        <label className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="Rechercher une tâche"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search size={15} />
                        </label>
                    </div>
                </div>

                <div className={styles.taskList}>
                    {filteredTasks.length === 0 ? (
                        <div className={styles.emptyState}>
                            Aucune tâche ne correspond aux filtres.
                        </div>
                    ) : (
                        filteredTasks.map((task) => (
                            <article key={task.id} className={styles.taskCard}>
                                <div className={styles.taskTop}>
                                    <div>
                                        <div className={styles.taskTitleRow}>
                                            <h3 className={styles.taskTitle}>
                                                {task.name || task.title || "Nom de la tâche"}
                                            </h3>
                                            <span
                                                className={`${styles.statusBadge} ${getStatusClass(
                                                    task.status,
                                                    styles
                                                )}`}
                                            >
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>

                                        <p className={styles.taskDescription}>
                                            {task.description || "Aucune description"}
                                        </p>
                                    </div>

                                    <button type="button" className={styles.moreButton}>
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                <div className={styles.taskMeta}>
                                    <span>
                                        Échéance : <CalendarDays size={14} />{" "}
                                        {formatDueDate(task.dueDate)}
                                    </span>
                                </div>

                                <div className={styles.assigneesRow}>
                                    <span className={styles.assigneesLabel}>Assigné à :</span>

                                    <div className={styles.assigneesList}>
                                        {(task.assignees || []).map((assignee) => (
                                            <div
                                                key={assignee.user.id}
                                                className={styles.assigneeChip}
                                            >
                                                <span className={styles.avatar}>
                                                    {getInitials(
                                                        assignee.user.name || assignee.user.email
                                                    )}
                                                </span>
                                                <span className={styles.memberName}>
                                                    {assignee.user.name || assignee.user.email}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.commentsRow}>
                                    Commentaires ({task.comments?.length || 0})
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>
            <EditProjectModal
  isOpen={isEditOpen}
  project={currentProject}
  onClose={() => setIsEditOpen(false)}
  onUpdated={() => router.replace(router.asPath)}
/>
        </main>
    );
}

export async function getServerSideProps(context) {
    const cookies = parse(context.req.headers.cookie || "");
    const token = cookies.auth_token;
    const { id } = context.params;

    if (!token) {
        return {
            redirect: {
                destination: "/connexion",
                permanent: false,
            },
        };
    }

    const res = await fetch(`http://localhost:8000/projects/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const errorText = await res.text();

        return {
            props: {
                project: null,
                error: `Project backend error (${res.status}): ${errorText}`,
            },
        };
    }

    const data = await res.json();

    return {
        props: {
            project: data?.data?.project || null,
            error: null,
        },
    };
}