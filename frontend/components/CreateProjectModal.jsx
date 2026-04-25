import { useState } from "react";
import styles from "../styles/CreateProjectModal.module.css";

export default function CreateProjectModal({ isOpen, onClose, onCreated }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [contributorQuery, setContributorQuery] = useState("");
    const [contributorResults, setContributorResults] = useState([]);
    const [selectedContributors, setSelectedContributors] = useState([]);

    if (!isOpen) return null;

    const canSubmit = name.trim() && description.trim();

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
                    !selectedContributors.some((selected) => selected.id === user.id)
            )
        );
    }

    function addContributor(user) {
        setSelectedContributors((prev) => [...prev, user]);
        setContributorQuery("");
        setContributorResults([]);
    }

    function removeContributor(userId) {
        setSelectedContributors((prev) =>
            prev.filter((user) => user.id !== userId)
        );
    }
    async function handleSubmit(e) {
        e.preventDefault();

        if (!canSubmit) return;

        setError("");
        setLoading(true);

        const contributors = selectedContributors.map((user) => user.email);

        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                    contributors,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Erreur lors de la création du projet");
            }

            setName("");
            setDescription("");
            setContributorQuery("");
            setContributorResults([]);
            setSelectedContributors([]);

            onCreated?.(data?.data?.project);
            onClose();
        } catch (err) {
            setError(err.message || "Erreur lors de la création du projet");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button type="button" className={styles.closeButton} onClick={onClose}>
                    ×
                </button>

                <h2 className={styles.title}>Créer un projet</h2>

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
                                placeholder="Choisir un ou plusieurs collaborateurs"
                            />

                            {contributorResults.length > 0 && (
                                <div className={styles.resultsList}>
                                    {contributorResults.map((user) => (
                                        <button
                                            type="button"
                                            key={user.id}
                                            className={styles.resultItem}
                                            onClick={() => addContributor(user)}
                                        >
                                            <span>{user.name || user.email}</span>
                                            <small>{user.email}</small>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedContributors.length > 0 && (
                            <div className={styles.selectedList}>
                                {selectedContributors.map((user) => (
                                    <button
                                        type="button"
                                        key={user.id}
                                        className={styles.selectedChip}
                                        onClick={() => removeContributor(user.id)}
                                    >
                                        {user.name || user.email} ×
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={!canSubmit || loading}
                    >
                        {loading ? "Création..." : "Ajouter un projet"}
                    </button>
                </form>
            </div>
        </div>
    );
}