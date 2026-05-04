import { parse } from "cookie";

export default async function handler(req, res) {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.auth_token;

    if (!token) {
        res.status(401).json({ message: "Non authentifié" });
        return;
    }

    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        res.status(405).json({ message: "Method not allowed" });
        return;
    }

    const { projectId, title, description, priority, dueDate, assigneeIds } =
        req.body;

    try {
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
    } catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Erreur serveur",
        });
    }
}