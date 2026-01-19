import { FaissStore } from "@langchain/community/vectorstores/faiss"; // Nom corrigé
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getAllCourses } from "../services/course.service.js";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export async function indexCourses() {
  console.log("🚀 Début de l'indexation avec FaissStore...");
  const courses = await getAllCourses();
  
  const documents = courses.map(course => ({
    pageContent: `Titre : ${course.course_title}\nContenu : ${course.content}`,
    metadata: { title: course.course_title }
  }));

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
  const chunks = await splitter.splitDocuments(documents);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    modelName: "text-embedding-004",
  });

  // Utilisation du nouveau nom FaissStore
  const vectorStore = await FaissStore.fromDocuments(chunks, embeddings);
  
  const directory = path.resolve("./faiss_index");
  await vectorStore.save(directory);

  console.log(`✅ Base FAISS créée avec succès dans : ${directory}`);
}