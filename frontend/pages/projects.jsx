import { parse } from "cookie";
import Link from "next/link";
import { Users } from "lucide-react";
import styles from "../styles/Projects.module.css";
import { useState } from "react";
import { useRouter } from "next/router";
import CreateProjectModal from "../components/CreateProjectModal";

function getRoleLabel(role) {
    switch (role) {
        case "OWNER":
            return "Propriétaire";
        case "ADMIN":
            return "Admin";
        case "CONTRIBUTOR":
            return "Contributeur";
        default:
            return "Membre";
    }
}

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

function buildTeam(project) {
    const owner = project.owner
        ? [
            {
                id: project.owner.id,
                name: project.owner.name || project.owner.email,
            },
        ]
        : [];

    const members =
        project.members?.map((member) => ({
            id: member.user.id,
            name: member.user.name || member.user.email,
        })) || [];

    const unique = new Map();

    [...owner, ...members].forEach((person) => {
        if (!unique.has(person.id)) {
            unique.set(person.id, person);
        }
    });

    return Array.from(unique.values());
}

export default function ProjectsPage({ projects, error }) {
    const router = useRouter();
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
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
                    <h1 className={styles.title}>Mes projets</h1>
                    <p className={styles.subtitle}>Gérez vos projets</p>
                </div>

                <button
                    className={styles.createButton}
                    type="button"
                    onClick={() => setIsCreateProjectOpen(true)}
                >
                    + Créer un projet
                </button>
            </section>

            <section className={styles.grid}>
                {projects.length === 0 ? (
                    <div className={styles.emptyState}>Aucun projet trouvé.</div>
                ) : (
                    projects.map((project) => {
                        const totalTasks = project.totalTasks ?? 0;
                        const doneTasks = project.doneTasks ?? 0;
                        const progress =
                            totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
                        const team = buildTeam(project);

                        return (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className={styles.card}
                            >
                                <h2 className={styles.cardTitle}>
                                    {project.name || "Nom du projet"}
                                </h2>

                                <p className={styles.cardDescription}>
                                    {project.description || "Aucune description"}
                                </p>

                                <div className={styles.progressHeader}>
                                    <span>Progression</span>
                                    <span>{progress}%</span>
                                </div>

                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <p className={styles.progressText}>
                                    {doneTasks}/{totalTasks} tâches terminées
                                </p>

                                <div className={styles.teamBlock}>
                                    <div className={styles.teamLabel}>
                                        <Users size={13} />
                                        <span>Équipe ({team.length})</span>
                                    </div>

                                    <div className={styles.teamRow}>
                                        {team.slice(0, 3).map((person) => (
                                            <span key={person.id} className={styles.avatar}>
                                                {getInitials(person.name)}
                                            </span>
                                        ))}

                                        <span className={styles.roleBadge}>
                                            {getRoleLabel(project.userRole)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </section>
            <CreateProjectModal
                isOpen={isCreateProjectOpen}
                onClose={() => setIsCreateProjectOpen(false)}
                onCreated={() => router.replace(router.asPath)}
            />
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

    const projectsRes = await fetch("http://localhost:8000/projects", { headers });

    if (!projectsRes.ok) {
        const errorText = await projectsRes.text();

        return {
            props: {
                projects: [],
                error: `Projects backend error (${projectsRes.status}): ${errorText}`,
            },
        };
    }

    const projectsData = await projectsRes.json();
    const projects = projectsData?.data?.projects || [];

    const detailedProjects = await Promise.all(
        projects.map(async (project) => {
            try {
                const res = await fetch(`http://localhost:8000/projects/${project.id}`, {
                    headers,
                });

                if (!res.ok) {
                    return {
                        ...project,
                        totalTasks: project?._count?.tasks || 0,
                        doneTasks: 0,
                    };
                }

                const data = await res.json();
                const fullProject = data?.data?.project;
                const tasks = fullProject?.tasks || [];

                const doneTasks = tasks.filter((task) => task.status === "DONE").length;

                return {
                    ...project,
                    totalTasks: tasks.length,
                    doneTasks,
                };
            } catch {
                return {
                    ...project,
                    totalTasks: project?._count?.tasks || 0,
                    doneTasks: 0,
                };
            }
        })
    );

    return {
        props: {
            projects: detailedProjects,
            error: null,
        },
    };
}