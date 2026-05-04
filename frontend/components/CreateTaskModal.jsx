import { useState } from "react";
import styles from "../styles/CreateTaskModal.module.css";

export default function CreateTaskModal({ isOpen, onClose, onCreated, project }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [assigneeQuery, setAssigneeQuery] = useState("");
    const [assigneeResults, setAssigneeResults] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const canSubmit = title.trim();

    async function handleAssigneeSearch(value) {
        setAssigneeQuery(value);

        if (value.trim().length < 2) {
            setAssigneeResults([]);
            return;
        }

        const users =
            project?.members?.map((member) => member.user) || [];

        const owner = project?.owner ? [project.owner] : [];
        const allUsers = [...owner, ...users];

        const filtered = allUsers.filter((user) => {
            const label = `${user.name || ""} ${user.email || ""}`.toLowerCase();

            return (
                label.includes(value.toLowerCase()) &&
                !selectedAssignees.some((selected) => selected.id === user.id)
            );
        });

        setAssigneeResults(filtered);
    }

    function addAssignee(user) {
        setSelectedAssignees((prev) => [...prev, user]);
        setAssigneeQuery("");
        setAssigneeResults([]);
    }

    function removeAssignee(userId) {
        setSelectedAssignees((prev) => prev.filter((user) => user.id !== userId));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!canSubmit) return;

        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    projectId: project.id,
                    title,
                    description,
                    priority,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                    assigneeIds: selectedAssignees.map((user) => user.id),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data?.message || "Erreur lors de la création de la tâche");
            }

            setTitle("");
            setDescription("");
            setDueDate("");           
            setPriority("MEDIUM");
            setSelectedAssignees([]);
            setAssigneeQuery("");
            setAssigneeResults([]);

            onCreated?.(data?.data?.task);
            onClose();
        } catch (err) {
            setError(err.message || "Erreur lors de la création de la tâche");
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

                <h2 className={styles.title}>Nouvelle tâche</h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Titre*</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Maquette page d'accueil"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Description</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Détails de la tâche..."
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Échéance</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Assigné à :</label>

                        <div className={styles.assigneeBox}>
                            <input
                                value={assigneeQuery}
                                onChange={(e) => handleAssigneeSearch(e.target.value)}
                                placeholder="Choisir un ou plusieurs collaborateurs"
                            />

                            {assigneeResults.length > 0 && (
                                <div className={styles.resultsList}>
                                    {assigneeResults.map((user) => (
                                        <button
                                            type="button"
                                            key={user.id}
                                            className={styles.resultItem}
                                            onClick={() => addAssignee(user)}
                                        >
                                            <span>{user.name || user.email}</span>
                                            <small>{user.email}</small>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedAssignees.length > 0 && (
                            <div className={styles.selectedList}>
                                {selectedAssignees.map((user) => (
                                    <button
                                        type="button"
                                        key={user.id}
                                        className={styles.selectedChip}
                                        onClick={() => removeAssignee(user.id)}
                                    >
                                        {user.name || user.email} ×
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.choiceGroup}>
                        <label>Priorité</label>

                        <div className={styles.priorityRow}>
                            {[
                                ["LOW", "Faible"],
                                ["MEDIUM", "Moyenne"],
                                ["HIGH", "Élevée"],
                                ["URGENT", "Urgente"],
                            ].map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`${styles.priorityButton} ${priority === value ? styles.priorityActive : ""
                                        }`}
                                    onClick={() => setPriority(value)}
                                >
                                    {label}
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
                        {loading ? "Création..." : "Créer la tâche"}
                    </button>
                </form>
            </div>
        </div>
    );
}