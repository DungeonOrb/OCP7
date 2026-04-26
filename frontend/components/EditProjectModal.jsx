import { useEffect, useState } from "react";
import styles from "../styles/EditProjectModal.module.css";

export default function EditProjectModal({
    isOpen,
    onClose,
    onUpdated,
    project,
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [contributorQuery, setContributorQuery] = useState("");
    const [contributorResults, setContributorResults] = useState([]);

    useEffect(() => {
        if (project) {
            setName(project.name || "");
            setDescription(project.description || "");
            setError("");
        }
    }, [project, isOpen]);

    if (!isOpen) return null;

    const canSubmit = name.trim() && description.trim();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!canSubmit) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/projects", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: project.id,
                    name,
                    description,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Erreur lors de la modification");
            }

            onUpdated?.(data?.data?.project);
            onClose();
        } catch (err) {
            setError(err.message || "Erreur lors de la modification");
        } finally {
            setLoading(false);
        }
    }

    const contributorsCount = project?.members?.length || 0;

async function handleContributorSearch(value) {
    setContributorQuery(value);

    if (value.trim().length < 2) {
        setContributorResults([]);
        return;
    }

    const res = await fetch(
        `/api/users/search?query=${encodeURIComponent(value.trim())}`
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        setContributorResults([]);
        return;
    }

    const users = data?.data?.users || [];

    setContributorResults(
        users.filter(
            (user) =>
                user.id !== project.owner?.id &&
                !(project.members || []).some((member) => member.user.id === user.id)
        )
    );
}

async function handleAddContributor(user) {
    setError("");

    const res = await fetch("/api/projects/contributors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            projectId: project.id,
            email: user.email,
            role: "CONTRIBUTOR",
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        setError(data?.message || "Erreur lors de l'ajout du contributeur");
        return;
    }

    setContributorQuery("");
    setContributorResults([]);
    onUpdated?.();
}

async function handleRemoveContributor(userId) {
    setError("");

    const res = await fetch("/api/projects/contributors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            projectId: project.id,
            userId,
        }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        setError(data?.message || "Erreur lors du retrait du contributeur");
        return;
    }

    onUpdated?.();
}
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    ×
                </button>

                <h2 className={styles.title}>Modifier un projet</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Titre*</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className={styles.field}>
                        <label>Description*</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Contributeurs</label>
                        <div className={styles.contributorBox}>
                            <input
                                value={contributorQuery}
                                onChange={(e) => handleContributorSearch(e.target.value)}
                                placeholder="Rechercher un collaborateur"
                            />

                            {contributorResults.length > 0 && (
                                <div className={styles.resultsList}>
                                    {contributorResults.map((user) => (
                                        <button
                                            type="button"
                                            key={user.id}
                                            className={styles.resultItem}
                                            onClick={() => handleAddContributor(user)}
                                        >
                                            <span>{user.name || user.email}</span>
                                            <small>{user.email}</small>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.selectedList}>
                            {(project.members || []).map((member) => (
                                <button
                                    type="button"
                                    key={member.user.id}
                                    className={styles.selectedChip}
                                    onClick={() => handleRemoveContributor(member.user.id)}
                                >
                                    {member.user.name || member.user.email} ×
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!canSubmit || loading}
                    >
                        {loading ? "Enregistrement..." : "Enregistrer"}
                    </button>
                </form>
            </div>
        </div>
    );
}
