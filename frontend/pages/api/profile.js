import { parse } from "cookie";

export default async function handler(req, res) {
  try {
    const cookies = parse(req.headers.cookie || "");
    const token = cookies.auth_token;

    if (!token) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (req.method === "GET") {
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
      return;
    }

    if (req.method === "PUT") {
      const target =
        req.body?.type === "password"
          ? "http://localhost:8000/auth/password"
          : "http://localhost:8000/auth/profile";

      const payload =
        req.body?.type === "password"
          ? {
              currentPassword: req.body.currentPassword,
              newPassword: req.body.newPassword,
            }
          : {
              name: req.body.name,
              email: req.body.email,
            };

      const backendRes = await fetch(target, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok) {
        res.status(backendRes.status).json({
          message:
            data?.message ||
            "Erreur lors de la mise à jour des informations",
          errors: data?.errors || null,
        });
        return;
      }

      res.status(200).json(data);
      return;
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
}