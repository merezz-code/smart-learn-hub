// backend/routes/admin.routes.js
import express from 'express';
import Course from '../models/rag/Course.js';
import CourseModule from '../models/CourseModule.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import db from '../src/db.js';

const router = express.Router();

// Middleware admin
function isAdmin(req, res, next) {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit - Admin uniquement' });
  }
  next();
}

// ========== STATISTIQUES ==========
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const stats = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          (SELECT COUNT(*) FROM courses) as total_courses,
          (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
          (SELECT COUNT(*) FROM lessons) as total_lessons,
          (SELECT COUNT(*) FROM quizzes) as total_quizzes,
          (SELECT COUNT(DISTINCT user_id) FROM user_progress) as active_students
        `,
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== COURS ==========
router.get('/courses', isAdmin, async (req, res) => {
  try {
    const courses = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM courses ORDER BY created_at DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/courses', isAdmin, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/courses/:id', isAdmin, async (req, res) => {
  try {
    const course = await Course.update(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/courses/:id', isAdmin, async (req, res) => {
  try {
    await Course.delete(req.params.id);
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/courses/:id/publish', isAdmin, async (req, res) => {
  try {
    const { published } = req.body;
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE courses SET published = ? WHERE id = ?`,
        [published ? 1 : 0, req.params.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: published ? 'Cours publié' : 'Cours dépublié' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MODULES ==========
router.get('/courses/:courseId/modules', isAdmin, async (req, res) => {
  try {
    console.log('🔍 Chargement modules pour cours:', req.params.courseId);
    
    const modules = await CourseModule.getWithLessons(req.params.courseId);
    
    console.log('✅ Modules trouvés:', modules.length);
    modules.forEach(m => {
      console.log(`  - ${m.title}: ${m.lessons?.length || 0} leçons`);
    });
    
    res.json(modules);
  } catch (error) {
    console.error('❌ Erreur chargement modules:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/modules', isAdmin, async (req, res) => {
  try {
    console.log('➕ Création module:', req.body);
    const module = await CourseModule.create(req.body);
    console.log('✅ Module créé:', module);
    res.status(201).json(module);
  } catch (error) {
    console.error('❌ Erreur création module:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/modules/:id', isAdmin, async (req, res) => {
  try {
    const module = await CourseModule.update(req.params.id, req.body);
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/modules/:id', isAdmin, async (req, res) => {
  try {
    await CourseModule.delete(req.params.id);
    res.json({ message: 'Module supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== LEÇONS ==========
router.post('/lessons', isAdmin, async (req, res) => {
  try {
    console.log('➕ Création leçon:', req.body);
    
    const lesson = await Lesson.create(req.body);
    
    console.log('✅ Leçon créée:', lesson);
    res.status(201).json(lesson);
  } catch (error) {
    console.error('❌ Erreur création leçon:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/lessons/:id', isAdmin, async (req, res) => {
  try {
    console.log('✏️ Modification leçon:', req.params.id, req.body);
    
    const lesson = await Lesson.update(req.params.id, req.body);
    
    console.log('✅ Leçon modifiée:', lesson);
    res.json(lesson);
  } catch (error) {
    console.error('❌ Erreur modification leçon:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/lessons/:id', isAdmin, async (req, res) => {
  try {
    await Lesson.delete(req.params.id);
    res.json({ message: 'Leçon supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== QUIZ ==========
router.post('/quizzes', isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/quizzes/:id', isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.update(req.params.id, req.body);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/quizzes/:id', isAdmin, async (req, res) => {
  try {
    await Quiz.delete(req.params.id);
    res.json({ message: 'Quiz supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== QUESTIONS ==========
router.post('/questions', isAdmin, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/questions/:id', isAdmin, async (req, res) => {
  try {
    const question = await Question.update(req.params.id, req.body);
    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/questions/:id', isAdmin, async (req, res) => {
  try {
    await Question.delete(req.params.id);
    res.json({ message: 'Question supprimée' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;