// backend/src/server.js
import express from 'express';
import cors from 'cors';

// Routes
import authRoutes from '../routes/auth.routes.js';
import adminRoutes from '../routes/admin.routes.js';
import courseRoutes from '../routes/course.routes.js';
import lessonRoutes from '../routes/lesson.routes.js';
import quizRoutes from '../routes/quiz.routes.js';
import progressRoutes from '../routes/progress.routes.js';

const app = express();
//

const PORT = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());
//


app.use(express.urlencoded({ extended: true }));
// Logger
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});


// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/admin', adminRoutes); 

//app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
//  Routes Quiz - monter sur /api pour avoir accès à /api/admin/courses/:id/quizzes
app.use('/api', quizRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});



// ====================================
// GESTION DES ERREURS
// ====================================

// Route 404 - doit être EN DERNIER
app.use((req, res) => {
  console.log('❌ 404 - Route non trouvée:', req.url);
  res.status(404).json({ 
    error: 'Route non trouvée',
    path: req.url,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    message: err.message 
  });
});

// ====================================
// DÉMARRAGE DU SERVEUR
// ====================================

// ⚠️ UN SEUL app.listen() !
app.listen(PORT, () => {
  console.log('\n====================================');
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('====================================');
  console.log('📋 Routes Quiz disponibles:');
  console.log('  GET    /api/quizzes/:id');
  console.log('  GET    /api/quizzes/course/:courseId');
  console.log('  GET    /api/quizzes/lesson/:lessonId');
  console.log('  POST   /api/quizzes');
  console.log('  POST   /api/quizzes/:quizId/questions');
  console.log('\n🔐 Routes Admin Quiz:');
  console.log('  GET    /api/admin/courses/:courseId/quizzes ⭐');
  console.log('  GET    /api/admin/quizzes/:id');
  console.log('  POST   /api/admin/quizzes');
  console.log('  PUT    /api/admin/quizzes/:id');
  console.log('  DELETE /api/admin/quizzes/:id');
  console.log('\n🏥 Health check:');
  console.log('  GET    /health');
  console.log('====================================\n');
});

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Serveur démarré sur le port ${PORT}`);
// });

export default app;

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import sqlite3 from "sqlite3";
// import { open } from "sqlite";
// import OpenAI from "openai";

// // 🔹 Résolution chemin absolu
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Importer vos routes
// const courseRoutes = require('../routes/course.routes');
// const lessonRoutes = require('../routes/lesson.routes');
// // const quizRoutes = require('../routes/quiz.routes');
// // const progressRoutes = require('../routes/progress.routes');

// // Après les routes existantes (chat)
// app.use('/api/courses', courseRoutes);
// app.use('/api/lessons', lessonRoutes);
// // app.use('/api/quizzes', quizRoutes);
// // app.use('/api/progress', progressRoutes);

// // 🔹 Charger .env depuis la racine backend
// dotenv.config({ path: path.join(__dirname, "../.env") });

// // Vérification
// console.log("PORT =", process.env.PORT);
// console.log("OPENAI_API_KEY =", process.env.OPENAI_API_KEY ? "OK" : "MISSING");

// // 🔹 SQLite
// async function openDB() {
//   return open({
//     filename: path.join(__dirname, "../database.sqlite"),
//     driver: sqlite3.Database,
//   });
// }

// // 🔹 OpenAI
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // 🔹 Express
// const app = express();
// app.use(cors());
// app.use(express.json());

// // 🔹 Récupération des cours
// async function getAllCourses() {
//   const db = await openDB();
//   const courses = await db.all("SELECT * FROM courses");
//   return courses;
// }

// // 🔹 Vector store en mémoire
// let vectorStore = [];

// // 🔹 Indexation des cours
// async function indexCourses() {
//   const courses = await getAllCourses();
//   vectorStore = courses.map(course => ({
//     id: course.id,
//     title: course.title,
//     content: course.content
//   }));
//   console.log("✅ Cours indexés pour RAG");
// }

// // 🔹 Endpoint RAG
// app.post("/api/chat/ask", async (req, res) => {
//   const { question } = req.body;
//   if (!question) return res.status(400).json({ error: "Question obligatoire" });

//   const matchedCourses = vectorStore.filter(course =>
//     course.content.toLowerCase().includes(question.toLowerCase())
//   );

//   const context = matchedCourses.map(c => c.content).join("\n\n") || "Pas de contexte trouvé.";

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "user",
//           content: `
// Tu es un assistant pédagogique pour une plateforme e-learning.
// Répond uniquement avec les informations du contexte fourni ci-dessous.
// Contexte :
// ${context}

// Question :
// ${question}

// Réponse claire, structurée et pédagogique :
// `
//         }
//       ],
//       temperature: 0.2,
//     });

//     const answer = response.choices[0].message.content;
//     res.json({ answer, sources: matchedCourses.map(c => c.title) });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur RAG" });
//   }
// });

// // 🔹 Démarrage serveur
// app.listen(process.env.PORT || 5000, async () => {
//   await indexCourses();
//   console.log(`Backend SmartLearn démarré sur http://localhost:${process.env.PORT || 5000}`);
// });
// work
