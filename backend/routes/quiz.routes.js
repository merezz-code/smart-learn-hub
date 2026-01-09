import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';

const router = express.Router();

router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    const questions = await Question.findByQuizId(quiz.id);
    res.json({ ...quiz, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET quiz par cours
router.get('/quizzes/course/:courseId', async (req, res) => {
  try {
    const quizzes = await Quiz.findByCourseId(req.params.courseId);
    
    // Compter les questions pour chaque quiz
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await Question.findByQuizId(quiz.id);
        return {
          ...quiz,
          questions_count: questions.length
        };
      })
    );
    
    res.json(quizzesWithCount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/quizzes/lesson/:lessonId', async (req, res) => {
  try {
    const quiz = await Quiz.findByLessonId(req.params.lessonId);
    if (!quiz) {
      return res.status(404).json({ error: 'Pas de quiz' });
    }
    
    const questions = await Question.findByQuizId(quiz.id);
    res.json({ ...quiz, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quizzes', async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quizzes/:quizId/questions', async (req, res) => {
  try {
    const question = await Question.create({
      quiz_id: req.params.quizId,
      ...req.body
    });
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ====================================
// ROUTES ADMIN (nouvelles - nécessaires pour l'éditeur)
// ====================================

// GET - Liste des quiz d'un cours (ADMIN)
// Si monté sur /api/quizzes, cette route sera accessible via /api/quizzes/admin/courses/:courseId/quizzes
// Si monté sur /api, cette route sera accessible via /api/admin/courses/:courseId/quizzes
router.get('/admin/courses/:courseId/quizzes', async (req, res) => {
  console.log('🎯 Route admin/courses/:courseId/quizzes appelée');
  console.log('📦 CourseId:', req.params.courseId);
  
  try {
    const { courseId } = req.params;
    console.log('🔍 Recherche des quiz pour le cours:', courseId);
    
    const quizzes = await Quiz.findByCourseId(courseId);
    console.log('✅ Quiz trouvés:', quizzes.length);
    
    // Ajouter le nombre de questions pour chaque quiz
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions_count = await Question.countByQuiz(quiz.id);
        return { ...quiz, questions_count };
      })
    );
    
    console.log('📤 Envoi de la réponse');
    res.json(quizzesWithCount);
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET - Quiz complet avec questions (ADMIN)
router.get('/admin/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    const questions = await Question.findByQuizId(id);
    
    res.json({
      ...quiz,
      questions
    });
  } catch (error) {
    console.error('Erreur récupération quiz:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer un quiz complet (ADMIN)
router.post('/admin/quizzes', async (req, res) => {
  try {
    const { questions, ...quizData } = req.body;
    
    console.log('📝 Création quiz:', quizData);
    
    // Créer le quiz
    const quiz = await Quiz.create(quizData);
    console.log('✅ Quiz créé:', quiz);
    
    // Créer les questions si elles existent
    if (questions && questions.length > 0) {
      console.log(`📋 Création de ${questions.length} questions...`);
      for (const question of questions) {
        await Question.create({
          ...question,
          quiz_id: quiz.id
        });
      }
      console.log('✅ Questions créées');
    }
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('❌ Erreur création quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Mettre à jour un quiz (ADMIN)
router.put('/admin/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { questions, ...quizData } = req.body;
    
    console.log('📝 Mise à jour quiz:', id);
    
    // Mettre à jour le quiz
    await Quiz.update(id, quizData);
    console.log('✅ Quiz mis à jour');
    
    // Supprimer les anciennes questions
    await Question.deleteByQuizId(id);
    console.log('🗑️ Anciennes questions supprimées');
    
    // Recréer les questions
    if (questions && questions.length > 0) {
      console.log(`📋 Recréation de ${questions.length} questions...`);
      for (const question of questions) {
        await Question.create({
          ...question,
          quiz_id: id
        });
      }
      console.log('✅ Questions recréées');
    }
    
    res.json({ message: 'Quiz mis à jour avec succès' });
  } catch (error) {
    console.error('❌ Erreur mise à jour quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un quiz (ADMIN)
router.delete('/admin/quizzes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Suppression quiz:', id);
    
    // Supprimer les questions
    await Question.deleteByQuizId(id);
    console.log('✅ Questions supprimées');
    
    // Supprimer le quiz
    await Quiz.delete(id);
    console.log('✅ Quiz supprimé');
    
    res.json({ message: 'Quiz supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;