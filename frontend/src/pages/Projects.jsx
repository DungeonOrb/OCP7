import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../services/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const result = await apiFetch("/projects");
        const list = result?.data || result?.projects || result || [];
        setProjects(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadProjects();
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link to={`/projects/${project.id}`}>
              {project.name || `Projet ${project.id}`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}