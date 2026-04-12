import { parse } from "cookie";

export default async function handler(req, res) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.auth_token;

    if (!token) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const backendRes = await fetch("http://localhost:8000/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      res.status(backendRes.status).json({
        message: data?.message || "Erreur lors de la récupération du profil",
      });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Erreur serveur lors de la récupération du profil",
    });
  }
}