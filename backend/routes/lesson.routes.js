import express from 'express';
import Lesson from '../models/Lesson.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);   
    if (!lesson) {
      return res.status(404).json({ error: 'Leçon non trouvée' });
    }
    res.json(lesson);
  } catch (error) {
    console.error('❌ Erreur récupération leçon:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lessons/course/:courseId
 * Récupérer toutes les leçons d'un cours
 */
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const lessons = await Lesson.findByCourseId(req.params.courseId);
    res.json(lessons);
  } catch (error) {
    console.error('❌ Erreur récupération leçons:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/lessons/module/:moduleId
 * Récupérer toutes les leçons d'un module
 */
router.get('/module/:moduleId', authenticateToken, async (req, res) => {
  try {
    const lessons = await Lesson.findByModuleId(req.params.moduleId);
    res.json(lessons);
  } catch (error) {
    console.error('❌ Erreur récupération leçons:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;