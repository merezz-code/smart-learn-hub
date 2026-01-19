import { FaissStore } from "@langchain/community/vectorstores/faiss"; // Nom corrigé
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import path from "path";

export async function getContext(question) {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "text-embedding-004",
    });

    const directory = path.resolve("./faiss_index");
    // Utilisation du nouveau nom FaissStore
    const vectorStore = await FaissStore.load(directory, embeddings);

    const results = await vectorStore.similaritySearchWithScore(question, 3);

    return results.map(([doc, score]) => ({
      text: doc.pageContent,
      title: doc.metadata.title,
      score: score
    }));
  } catch (error) {
    console.error("❌ Erreur FAISS :", error.message);
    return [];
  }
}