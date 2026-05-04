import { parse } from "cookie";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  const { projectId } = req.body;

  if (!projectId) {
    res.status(400).json({ message: "ID du projet manquant" });
    return;
  }

  try {
    if (req.method === "POST") {
      const { title, description, priority, dueDate, assigneeIds } = req.body;

      const backendRes = await fetch(
        `http://localhost:8000/projects/${projectId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            priority,
            dueDate,
            assigneeIds,
          }),
        }
      );

      const data = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok) {
        res.status(backendRes.status).json({
          message: data?.message || "Erreur lors de la création de la tâche",
          errors: data?.errors || null,
        });
        return;
      }

      res.status(201).json(data);
      return;
    }

    if (req.method === "PUT") {
      const {
        taskId,
        title,
        description,
        status,
        priority,
        dueDate,
        assigneeIds,
      } = req.body;

      if (!taskId) {
        res.status(400).json({ message: "ID de tâche manquant" });
        return;
      }

      const backendRes = await fetch(
        `http://localhost:8000/projects/${projectId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
            dueDate,
            assigneeIds,
          }),
        }
      );

      const data = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok) {
        res.status(backendRes.status).json({
          message: data?.message || "Erreur lors de la modification de la tâche",
          errors: data?.errors || null,
        });
        return;
      }

      res.status(200).json(data);
      return;
    }

    if (req.method === "DELETE") {
      const { taskId } = req.body;

      if (!taskId) {
        res.status(400).json({ message: "ID de tâche manquant" });
        return;
      }

      const backendRes = await fetch(
        `http://localhost:8000/projects/${projectId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok) {
        res.status(backendRes.status).json({
          message: data?.message || "Erreur lors de la suppression de la tâche",
          errors: data?.errors || null,
        });
        return;
      }

      res.status(200).json(data);
      return;
    }

    res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
}