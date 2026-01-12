// backend/routes/admin.routes.js
import express from 'express';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import db from '../config/database.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';
import {
  courseSchema,
  moduleSchema,
  lessonSchema,
  quizSchema,
  questionSchema,
  publishCourseSchema,
  updateUserSchema,
  validate
} from '../validators/validators.js';

const router = express.Router();

// Appliquer l'authentification à toutes les routes admin
router.use(authenticateToken);
router.use(isAdmin);

// ========================================
// STATISTIQUES DASHBOARD
// ========================================

router.get('/stats', async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM courses WHERE published = 1) as published_courses,
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins,
          (SELECT COUNT(*) FROM lessons) as total_lessons,
          (SELECT COUNT(*) FROM quizzes) as total_quizzes,
          (SELECT COUNT(DISTINCT user_id) FROM user_progress) as active_students,
          (SELECT COUNT(*) FROM user_progress WHERE completed = 1 AND lesson_id IS NOT NULL) as completed_lessons
        `,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    // Statistiques des 30 derniers jours
    const recentStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= DATE('now', '-30 days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const enrolledCount = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(DISTINCT course_id) as enrolled_courses
         FROM user_progress
         WHERE lesson_id IS NULL`,
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.enrolled_courses || 0);
        }
      );
    });

    console.log('✅ Stats admin:', { ...stats, enrolled_courses: enrolledCount });

    res.json({
      ...stats,
      enrolled_courses: enrolledCount,
      recent_registrations: recentStats
    });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GESTION DES COURS
// ========================================

// GET - Liste tous les cours (publiés + brouillons)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAllIncludingDrafts();
    res.json(courses);
  } catch (error) {
    console.error('❌ Erreur récupération cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Détails d'un cours
router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }
    res.json(course);
  } catch (error) {
    console.error('❌ Erreur récupération cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un cours
router.post('/courses', validate(courseSchema), async (req, res) => {
  try {
    console.log('➕ Création cours:', req.body.title);
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    console.error('❌ Erreur création cours:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier un cours
router.put('/courses/:id', validate(courseSchema), async (req, res) => {
  try {
    console.log('✏️  Modification cours:', req.params.id);
    const course = await Course.update(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    console.error('❌ Erreur modification cours:', error);
    if (error.message === 'Cours non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Publier/Dépublier un cours
router.patch('/courses/:id/publish', validate(publishCourseSchema), async (req, res) => {
  try {
    const { published } = req.body;
    console.log(`${published ? '✅' : '❌'} ${published ? 'Publication' : 'Dépublication'} cours:`, req.params.id);
    await Course.togglePublish(req.params.id, published);
    res.json({ 
      message: published ? 'Cours publié' : 'Cours dépublié',
      published 
    });
  } catch (error) {
    console.error('❌ Erreur publication cours:', error);
    if (error.message === 'Cours non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un cours
router.delete('/courses/:id', async (req, res) => {
  try {
    console.log('🗑️  Suppression cours:', req.params.id);
    await Course.delete(req.params.id);
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression cours:', error);
    if (error.message === 'Cours non trouvé') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GESTION DES MODULES
// ========================================

// GET - Modules d'un cours
router.get('/courses/:courseId/modules', async (req, res) => {
  try {
    console.log('🔍 Chargement modules pour cours:', req.params.courseId);
    const modules = await CourseModule.getWithLessons(req.params.courseId);
    console.log('✅ Modules trouvés:', modules.length);
    res.json(modules);
  } catch (error) {
    console.error('❌ Erreur chargement modules:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un module
router.post('/modules', validate(moduleSchema), async (req, res) => {
  try {
    console.log('➕ Création module:', req.body.title);
    const module = await CourseModule.create(req.body);
    res.status(201).json(module);
  } catch (error) {
    console.error('❌ Erreur création module:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier un module
router.put('/modules/:id', validate(moduleSchema), async (req, res) => {
  try {
    console.log('✏️  Modification module:', req.params.id);
    const module = await CourseModule.update(req.params.id, req.body);
    res.json(module);
  } catch (error) {
    console.error('❌ Erreur modification module:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un module
router.delete('/modules/:id', async (req, res) => {
  try {
    console.log('🗑️  Suppression module:', req.params.id);
    await CourseModule.delete(req.params.id);
    res.json({ message: 'Module supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression module:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GESTION DES LEÇONS
// ========================================

// GET - Leçons d'un module
router.get('/modules/:moduleId/lessons', async (req, res) => {
  try {
    const lessons = await Lesson.findByModuleId(req.params.moduleId);
    res.json(lessons);
  } catch (error) {
    console.error('❌ Erreur récupération leçons:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer une leçon
router.post('/lessons', validate(lessonSchema), async (req, res) => {
  try {
    console.log('➕ Création leçon:', req.body.title);
    const lesson = await Lesson.create(req.body);
    res.status(201).json(lesson);
  } catch (error) {
    console.error('❌ Erreur création leçon:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier une leçon
router.put('/lessons/:id', validate(lessonSchema), async (req, res) => {
  try {
    console.log('✏️  Modification leçon:', req.params.id);
    const lesson = await Lesson.update(req.params.id, req.body);
    res.json(lesson);
  } catch (error) {
    console.error('❌ Erreur modification leçon:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer une leçon
router.delete('/lessons/:id', async (req, res) => {
  try {
    console.log('🗑️  Suppression leçon:', req.params.id);
    await Lesson.delete(req.params.id);
    res.json({ message: 'Leçon supprimée' });
  } catch (error) {
    console.error('❌ Erreur suppression leçon:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GESTION DES QUIZ
// ========================================

// GET - Quiz d'un cours
router.get('/courses/:courseId/quizzes', async (req, res) => {
  try {
    console.log('🔍 Récupération quiz pour cours:', req.params.courseId);
    const quizzes = await Quiz.findByCourseId(req.params.courseId);
    
    // Ajouter le nombre de questions pour chaque quiz
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions_count = await Question.countByQuiz(quiz.id);
        return { ...quiz, questions_count };
      })
    );
    
    res.json(quizzesWithCount);
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Quiz complet avec questions
router.get('/quizzes/:id', async (req, res) => {
  try {
    console.log('🔍 Récupération quiz complet:', req.params.id);
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    const questions = await Question.findByQuizId(req.params.id);
    
    // Parser les options si elles sont en string
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
    
    console.log('✅ Quiz trouvé avec', parsedQuestions.length, 'questions');
    res.json({ ...quiz, questions: parsedQuestions });
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer un quiz
router.post('/quizzes', validate(quizSchema), async (req, res) => {
  try {
    console.log('➕ Création quiz:', req.body.title);
    const quiz = await Quiz.create(req.body);
    console.log('✅ Quiz créé avec ID:', quiz.id);
    res.status(201).json(quiz);
  } catch (error) {
    console.error('❌ Erreur création quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier un quiz
router.put('/quizzes/:id', validate(quizSchema), async (req, res) => {
  try {
    console.log('✏️  Modification quiz:', req.params.id);
    const quiz = await Quiz.update(req.params.id, req.body);
    res.json(quiz);
  } catch (error) {
    console.error('❌ Erreur modification quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un quiz
router.delete('/quizzes/:id', async (req, res) => {
  try {
    console.log('🗑️  Suppression quiz:', req.params.id);
    
    // Supprimer d'abord les questions associées
    await Question.deleteByQuizId(req.params.id);
    
    // Puis supprimer le quiz
    await Quiz.delete(req.params.id);
    
    res.json({ message: 'Quiz supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer toutes les questions d'un quiz (utilisé avant la mise à jour)
router.delete('/quizzes/:quizId/questions', async (req, res) => {
  try {
    console.log('🗑️  Suppression questions du quiz:', req.params.quizId);
    await Question.deleteByQuizId(req.params.quizId);
    res.json({ message: 'Questions supprimées' });
  } catch (error) {
    console.error('❌ Erreur suppression questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GESTION DES QUESTIONS
// ========================================

// GET - Questions d'un quiz
router.get('/quizzes/:quizId/questions', async (req, res) => {
  try {
    const questions = await Question.findByQuizId(req.params.quizId);
    
    // Parser les options si elles sont en string
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
    
    res.json(parsedQuestions);
  } catch (error) {
    console.error('❌ Erreur récupération questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Créer une question
router.post('/questions', validate(questionSchema), async (req, res) => {
  try {
    console.log('➕ Création question pour quiz:', req.body.quiz_id);
    console.log('Données question:', JSON.stringify(req.body, null, 2));
    
    const question = await Question.create(req.body);
    console.log('✅ Question créée avec ID:', question.id);
    
    res.status(201).json(question);
  } catch (error) {
    console.error('❌ Erreur création question:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier une question
router.put('/questions/:id', validate(questionSchema), async (req, res) => {
  try {
    console.log('✏️  Modification question:', req.params.id);
    const question = await Question.update(req.params.id, req.body);
    res.json(question);
  } catch (error) {
    console.error('❌ Erreur modification question:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer une question
router.delete('/questions/:id', async (req, res) => {
  try {
    console.log('🗑️  Suppression question:', req.params.id);
    await Question.delete(req.params.id);
    res.json({ message: 'Question supprimée' });
  } catch (error) {
    console.error('❌ Erreur suppression question:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GESTION DES UTILISATEURS
// ========================================

// GET - Liste tous les utilisateurs
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    const users = await User.findAll({ role, search });
    res.json(users);
  } catch (error) {
    console.error('❌ Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET - Détails d'un utilisateur
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT - Modifier un utilisateur
router.put('/users/:id', validate(updateUserSchema), async (req, res) => {
  try {
    console.log('✏️  Modification utilisateur:', req.params.id);
    const user = await User.update(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    console.error('❌ Erreur modification utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

// PATCH - Changer le rôle
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }
    
    console.log('👤 Changement rôle utilisateur:', req.params.id, '→', role);
    await User.updateRole(req.params.id, role);
    res.json({ message: 'Rôle modifié', role });
  } catch (error) {
    console.error('❌ Erreur changement rôle:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    // Empêcher la suppression de son propre compte
    if (req.user.id === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }
    
    console.log('🗑️  Suppression utilisateur:', req.params.id);
    await User.delete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;