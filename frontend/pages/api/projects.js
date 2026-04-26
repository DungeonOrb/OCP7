import { parse } from "cookie";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  if (req.method === "POST") {
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
      });
      return;
    }

    res.status(201).json(data);
    return;
  }

  if (req.method === "PUT") {
    const { id, name, description } = req.body;

    const backendRes = await fetch(`http://localhost:8000/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        message: data?.message || "Erreur lors de la modification du projet",
      });
      return;
    }

    res.status(200).json(data);
    return;
  }

  res.setHeader("Allow", ["POST", "PUT"]);
  res.status(405).json({ message: "Method not allowed" });
}