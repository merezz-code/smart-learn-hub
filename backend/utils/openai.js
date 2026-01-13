import OpenAI from 'openai';
import dotenv from 'dotenv';

// Charger les variables d'environnement (.env)
dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  console.warn("⚠️ Attention: GOOGLE_API_KEY est manquante dans le fichier .env");
}

// Initialisation de l'instance OpenAI
export const openai = new OpenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});