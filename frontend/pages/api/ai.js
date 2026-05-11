import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        apiKeyError:
          "La clé API Gemini est manquante. Ajoutez GEMINI_API_KEY dans frontend-next/.env.local",
      });
      return;
    }

    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({
        error: "Veuillez décrire les tâches à générer.",
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const systemInstruction = `
Tu es un extracteur de tâches. Ton rôle est de lire le texte de l'utilisateur et d'extraire les tâches à créer.

Règles :
1. Retourne TOUJOURS un JSON avec cette structure exacte :
{
  "tasks": [
    { "id": "string", "title": "string", "description": "string" }
  ],
  "error": null | "string"
}
2. Si l'utilisateur décrit plus de 3 tâches, extrais-les toutes dans le tableau, mais remplis le champ "error" avec : "Vous pouvez créer un maximum de 3 tâches à la fois."
3. Si le nombre de tâches est inférieur ou égal à 3, le champ "error" doit être null.
4. Sois concis pour les titres et les descriptions.
5. Tout doit toujours être en français.
6. Si le prompt est trop générique, invente un titre et une description, max 50 caractères, thème développement web ou web design.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    res.status(200).json(json);
  } catch (error) {
    console.error("Erreur API IA:", error);

    res.status(500).json({
      error: "Erreur API",
    });
  }
}