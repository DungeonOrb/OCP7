import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { apiFetch } from "../services/api";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const projectResult = await apiFetch(`/projects/${id}`);
        const taskResult = await apiFetch(`/projects/${id}/tasks`);

        setProject(projectResult?.data || projectResult);
        setTasks(taskResult?.data || taskResult?.tasks || taskResult || []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadProject();
  }, [id]);

  return (
    <div>
      <h1>Détails du projet</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h2>{project?.name}</h2>
      <p>{project?.description}</p>

      <h3>Tâches</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
          </li>
        ))}
      </ul>
    </div>
  );
}