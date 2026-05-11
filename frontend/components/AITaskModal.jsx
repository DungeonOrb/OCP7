import { useState } from "react";
import { Sparkles, Trash2, Pencil } from "lucide-react";
import styles from "../styles/AITaskModal.module.css";

async function createTasksWithAI(text) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ prompt: text }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const json = await response.json().catch(() => ({}));

      if (json.apiKeyError) {
        return {
          success: false,
          status: response.status,
          apiKeyError: json.apiKeyError,
        };
      }

      return {
        success: false,
        status: response.status,
        message: json.error || "Erreur API IA",
      };
    }

    return {
      success: true,
      data: await response.json(),
    };
  } catch (error) {
    return {
      success: false,
      status: error?.status,
      message: "Erreur lors de la génération des tâches",
    };
  }
}

export default function AITaskModal({ isOpen, onClose, project, onCreated }) {
  const [prompt, setPrompt] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [aiError, setAiError] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  async function handleGenerate(e) {
    e.preventDefault();

    setAiError("");
    setLoadingAI(true);

    const result = await createTasksWithAI(prompt);

    if (!result.success) {
      setAiError(result.apiKeyError || result.message || "Erreur API IA");
      setLoadingAI(false);
      return;
    }

    const tasks = result.data?.tasks || [];

    setGeneratedTasks(
      tasks.slice(0, 3).map((task, index) => ({
        id: task.id || `ai-task-${index}`,
        title: task.title || "Nouvelle tâche",
        description: task.description || "Description de la tâche",
      }))
    );

    if (result.data?.error) {
      setAiError(result.data.error);
    }

    setLoadingAI(false);
  }

  function removeGeneratedTask(taskId) {
    setGeneratedTasks((prev) => prev.filter((task) => task.id !== taskId));
  }

  function updateGeneratedTask(taskId, field, value) {
    setGeneratedTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );
  }

  async function handleAddTasks() {
    if (generatedTasks.length === 0) return;

    setSaving(true);
    setAiError("");

    try {
      for (const task of generatedTasks) {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: project.id,
            title: task.title,
            description: task.description,
            priority: "MEDIUM",
            dueDate: null,
            assigneeIds: [],
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data?.message || "Erreur lors de l'ajout des tâches"
          );
        }
      }

      setPrompt("");
      setGeneratedTasks([]);
      onCreated?.();
      onClose();
    } catch (error) {
      setAiError(error.message || "Erreur lors de l'ajout des tâches");
    } finally {
      setSaving(false);
    }
  }

  const hasGeneratedTasks = generatedTasks.length > 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          ×
        </button>

        {!hasGeneratedTasks ? (
          <>
            <h2 className={styles.title}>
              <Sparkles size={16} className={styles.sparkle} />
              Créer une tâche
            </h2>

            <form onSubmit={handleGenerate} className={styles.promptForm}>
              <div className={styles.spacer} />

              {aiError ? <p className={styles.error}>{aiError}</p> : null}

              <div className={styles.promptBox}>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Décrivez les tâches que vous souhaitez ajouter..."
                />

                <button
                  type="submit"
                  disabled={!prompt.trim() || loadingAI}
                  className={styles.promptButton}
                >
                  +
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2 className={styles.title}>
              <Sparkles size={16} className={styles.sparkle} />
              Vos tâches...
            </h2>

            {aiError ? <p className={styles.error}>{aiError}</p> : null}

            <div className={styles.generatedList}>
              {generatedTasks.map((task) => (
                <article key={task.id} className={styles.taskCard}>
                  <input
                    className={styles.taskTitleInput}
                    value={task.title}
                    onChange={(e) =>
                      updateGeneratedTask(task.id, "title", e.target.value)
                    }
                  />

                  <input
                    className={styles.taskDescriptionInput}
                    value={task.description}
                    onChange={(e) =>
                      updateGeneratedTask(
                        task.id,
                        "description",
                        e.target.value
                      )
                    }
                  />

                  <div className={styles.taskActions}>
                    <button
                      type="button"
                      onClick={() => removeGeneratedTask(task.id)}
                    >
                      <Trash2 size={13} />
                      Supprimer
                    </button>

                    <span>
                      <Pencil size={13} />
                      Modifier
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              className={styles.addTasksButton}
              onClick={handleAddTasks}
              disabled={saving || generatedTasks.length === 0}
            >
              {saving ? "Ajout..." : "+ Ajouter les tâches"}
            </button>

            <div className={styles.promptBoxBottom}>
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Décrivez les tâches que vous souhaitez ajouter..."
              />

              <button
                type="button"
                disabled={!prompt.trim() || loadingAI}
                onClick={handleGenerate}
                className={styles.promptButton}
              >
                +
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}