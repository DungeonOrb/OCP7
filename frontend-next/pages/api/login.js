import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const backendRes = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return res.status(backendRes.status).json({
        message: data?.message || "Erreur lors de la connexion",
      });
    }

    const token = data?.data?.token;

    if (!token) {
      return res.status(500).json({
        message: "Token introuvable dans la réponse backend",
      });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    return res.status(200).json({
      success: true,
      user: data?.data?.user || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Erreur serveur",
    });
  }
}