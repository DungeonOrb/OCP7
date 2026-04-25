import { parse } from "cookie";

export default async function handler(req, res) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    res.status(401).json({ message: "Non authentifié" });
    return;
  }

  const query = req.query.query || "";

  if (!query || query.length < 2) {
    res.status(200).json({ success: true, data: { users: [] } });
    return;
  }

  try {
    const backendRes = await fetch(
      `http://localhost:8000/users/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        message: data?.message || "Erreur lors de la recherche utilisateurs",
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