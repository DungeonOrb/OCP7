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

  try {
    const backendRes = await fetch("http://localhost:8000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        message: data?.message || "Erreur lors de la création du projet",
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