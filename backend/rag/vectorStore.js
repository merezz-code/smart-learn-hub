import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { getAllCourses } from "../services/course.service.js";

let localCache = null;
let lastUpdate = null;
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export async function getContext(question) {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    throw new Error("❌ GOOGLE_API_KEY est manquante dans le fichier .env");
  }

  // Initialisation des embeddings Google
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: apiKey,
    modelName: "text-embedding-004", 
  });
  
  // Vérifier si le cache doit être rafraîchi
  const shouldRefresh = !localCache || 
                        !lastUpdate || 
                        (Date.now() - lastUpdate) > CACHE_DURATION;
  
  if (shouldRefresh) {
    console.log("⏳ Chargement et vectorisation des cours avec Gemini...");
    const courses = await getAllCourses();
    
    if (!courses || courses.length === 0) {
      console.warn("⚠️ Aucun cours trouvé dans la base de données");
      return [];
    }
    
    console.log(`📚 ${courses.length} cours trouvés`);
    
    localCache = await Promise.all(courses.map(async (c) => {
      const text = `Titre: ${c.course_title}\nDescription: ${c.short_description || ''}\nContenu: ${c.content}`;
      const vector = await embeddings.embedQuery(text);
      return { 
        text, 
        vector, 
        title: c.course_title,
        courseId: c.id 
      };
    }));
    
    lastUpdate = Date.now();
    console.log("✅ Cours vectorisés et mis en cache");
  } else {
    console.log("💾 Utilisation du cache existant");
  }

  console.log("🔎 Vectorisation de la question...");
  const queryVector = await embeddings.embedQuery(question);

  // Calcul de similarité cosinus
  const sorted = localCache.map(item => ({
    ...item,
    score: cosineSimilarity(queryVector, item.vector)
  }))
  .sort((a, b) => b.score - a.score)
  .filter(item => item.score > 0.3); // Seuil de pertinence

  console.log(`📊 ${sorted.length} documents pertinents trouvés`);
  if (sorted.length > 0) {
    console.log(`   Top score: ${(sorted[0].score * 100).toFixed(1)}%`);
  }

  return sorted.slice(0, 3);
}

// Calcul de similarité cosinus (plus précis que le produit scalaire)
function cosineSimilarity(a, b) {
  const dotProd = dotProduct(a, b);
  const magA = Math.sqrt(dotProduct(a, a));
  const magB = Math.sqrt(dotProduct(b, b));
  return dotProd / (magA * magB);
}

function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

// Fonction pour forcer le rafraîchissement du cache
export function clearCache() {
  localCache = null;
  lastUpdate = null;
  console.log("🗑️ Cache vidé");
}