import { getContext } from "./vectorStore.js";
import dotenv from "dotenv";

dotenv.config();

export async function answerQuestion(question) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = "meta-llama/Meta-Llama-3-8B-Instruct";

  // 1. Récupération du contexte via Chroma
  const topDocs = await getContext(question);

  if (topDocs.length === 0) {
    return { answer: "Désolé, je ne trouve aucune information dans les cours.", sources: [] };
  }

  const context = topDocs.map(d => d.text).join("\n\n---\n\n");

  // 2. Appel à Hugging Face
  const url = "https://router.huggingface.co/v1/chat/completions";

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
          content: `Tu es SmartLearn, un tuteur expert en informatique. 
    1. Si la réponse est dans le CONTEXTE fourni, utilise-le en priorité et cite le nom du cours.
    2. Si la réponse n'est pas dans le contexte, utilise tes propres connaissances pour répondre, mais précise poliment que ce point n'est pas abordé dans les cours officiels.`
        },
        {
          role: "user",
          content: `CONTEXTE:\n${context}\n\nQUESTION: ${question}`
        }
      ],
      max_tokens: 500,
    }),
  });

  const result = await response.json();

  // Gestion d'erreur robuste
  if (response.status !== 200) {
    throw new Error(result.error || "Erreur LLM");
  }

  return {
    answer: result.choices[0].message.content,
    sources: [...new Set(topDocs.map(d => d.title))],
    // Correction ici : on récupère le score du premier document trouvé
    confidence: topDocs[0] ? topDocs[0].score : 0
  };


}