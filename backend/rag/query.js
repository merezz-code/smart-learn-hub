import { getContext } from "./vectorStore.js";
import dotenv from "dotenv";

dotenv.config();

export async function answerQuestion(question) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY manquante dans .env");
  }

  const model = "meta-llama/Meta-Llama-3-8B-Instruct";

  console.log("🔍 Recherche de contexte pertinent...");
  const topDocs = await getContext(question);
  const context = topDocs.map(d => d.text).join("\n\n---\n\n");

  console.log(`🤖 Appel de ${model} via HF Inference Providers...`);

  const url = "https://router.huggingface.co/v1/chat/completions";

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "Tu es SmartLearn, un tuteur expert. Réponds en français en utilisant uniquement le contexte fourni."
          },
          {
            role: "user",
            content: `CONTEXTE:\n${context}\n\nQUESTION: ${question}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); // ← beaucoup plus utile que .json() quand c'est du texte/plain
      console.error("Réponse HF non-OK:", response.status, errorText);

      if (response.status === 503) {
        throw new Error("Le modèle est en train de charger. Réessaie dans 30-60 secondes.");
      }
      if (response.status === 429) {
        throw new Error("Rate limit dépassé sur HF Inference.");
      }
      throw new Error(`Erreur API Hugging Face (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    const answer = result.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("Réponse mal formée de l'API");
    }

    return {
      answer,
      sources: [...new Set(topDocs.map(d => d.title))],
      confidence: topDocs[0]?.score || 0
    };

  } catch (error) {
    console.error("❌ Détails de l'erreur:", error.message);
    throw error;
  }
}