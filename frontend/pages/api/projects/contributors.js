import { parse } from "cookie";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  const { projectId, email, userId, role = "CONTRIBUTOR" } = req.body;

  try {
    let backendRes;

    if (req.method === "POST") {
      backendRes = await fetch(
        `http://localhost:8000/projects/${projectId}/contributors`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, role }),
        }
      );
    } else if (req.method === "DELETE") {
      backendRes = await fetch(
        `http://localhost:8000/projects/${projectId}/contributors/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } else {
      res.setHeader("Allow", ["POST", "DELETE"]);
      res.status(405).json({ message: "Method not allowed" });
      return;
    }

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        message: data?.message || "Erreur contributeur",
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
}