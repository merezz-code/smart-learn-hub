import dotenv from "dotenv";
import { answerQuestion } from "./query.js";

dotenv.config();

async function test() {
  console.log("\n🧪 === TEST DU TUTEUR IA SMARTLEARN ===\n");
  
  // Vérification de l'environnement
  if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ ERREUR: Variable GOOGLE_API_KEY manquante dans .env");
    console.log("\n📝 Créez un fichier .env avec:");
    console.log("GOOGLE_API_KEY=votre_clé_ici\n");
    process.exit(1);
  }
  
  console.log("✅ Clé API détectée");
  console.log("─".repeat(50));

  const questions = [
    "Qu'est-ce que le machine learning ?",
    "Comment fonctionne un réseau de neurones ?",
    "Quels sont les types d'apprentissage automatique ?"
  ];

  for (const question of questions) {
    try {
      console.log(`\n❓ Question: "${question}"\n`);
      
      const result = await answerQuestion(question);
      
      console.log("💡 Réponse:");
      console.log(result.answer);
      console.log("\n📚 Sources utilisées:", result.sources.join(", "));
      console.log("🎯 Confiance:", (result.confidence * 100).toFixed(1) + "%");
      console.log("─".repeat(50));
      
    } catch (error) {
      console.error(`\n❌ Erreur pour la question "${question}":`, error.message);
      console.error("Stack:", error.stack);
      break;
    }
  }
  
  console.log("\n✅ Tests terminés\n");
}

test().catch(err => {
  console.error("\n💥 Erreur fatale:", err.message);
  console.error(err.stack);
  process.exit(1);
});