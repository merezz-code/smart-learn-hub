import express from "express";
import { answerQuestion } from "../rag/query.js";
import { clearCache } from "../rag/vectorStore.js";

const router = express.Router();

/**
 * POST /api/rag/ask
 * Poser une question au tuteur IA
 */
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  
  if (!question || question.trim().length === 0) {
    return res.status(400).json({ 
      error: "La question est requise" 
    });
  }

  if (question.length > 500) {
    return res.status(400).json({ 
      error: "La question est trop longue (max 500 caractères)" 
    });
  }

  try {
    console.log(`\n📝 Question reçue: "${question}"`);
    const startTime = Date.now();
    
    const result = await answerQuestion(question);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ Réponse générée en ${responseTime}ms\n`);
    
    res.json({
      ...result,
      responseTime: `${responseTime}ms`
    }); 
  } catch (err) {
    console.error("🔥 Erreur RAG:", err.message);
    res.status(500).json({ 
      error: "Erreur lors de la génération de la réponse",
      details: err.message 
    });
  }
});

/**
 * POST /api/rag/refresh
 * Rafraîchir le cache des cours vectorisés
 */
router.post("/refresh", async (req, res) => {
  try {
    console.log("🔄 Rafraîchissement du cache demandé");
    clearCache();
    res.json({ 
      message: "Cache rafraîchi avec succès",
      info: "Les cours seront re-vectorisés à la prochaine question"
    });
  } catch (err) {
    console.error("❌ Erreur refresh:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rag/status
 * Vérifier le statut du système RAG
 */
router.get("/status", (req, res) => {
  const hasApiKey = !!process.env.GOOGLE_API_KEY;
  
  res.json({
    status: hasApiKey ? "operational" : "configuration_required",
    apiKey: hasApiKey ? "configured" : "missing",
    model: "gemini-pro",
    embeddingModel: "text-embedding-004"
  });
});

export default router;