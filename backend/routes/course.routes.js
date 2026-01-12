// backend/routes/course.routes.js
import express from 'express';
import Course from '../models/Course.js';
import db from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/courses
 * Récupérer tous les cours publiés
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, level, search } = req.query;

    let courses;

    if (category) {
      courses = await Course.findByCategory(category);
    } else if (search) {
      courses = await Course.search(search);
    } else {
      courses = await Course.findAll();
    }

    // Filtrer par niveau si demandé
    if (level) {
      courses = courses.filter(c => c.level === level);
    }

    res.json(courses);
  } catch (error) {
    console.error('❌ Erreur récupération cours:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/courses/:id
 * Récupérer un cours par ID
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Vérifier si publié (sauf si admin)
    if (!course.published && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ error: 'Cours non disponible' });
    }

    res.json(course);
  } catch (error) {
    console.error('❌ Erreur récupération cours:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/courses/:courseId/modules
 * Récupérer les modules et leçons d'un cours (PUBLIC)
 */
router.get('/:courseId/modules', optionalAuth, async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log('🔍 Récupération modules pour cours:', courseId);

    // Vérifier que le cours existe et est publié
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    if (!course.published && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Cours non disponible' });
    }

    // Récupérer les modules
    const modules = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM course_modules 
         WHERE course_id = ? 
         ORDER BY order_index`,
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    // Pour chaque module, récupérer ses leçons
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await new Promise((resolve, reject) => {
          db.all(
            `SELECT * FROM lessons 
             WHERE module_id = ? 
             ORDER BY order_index`,
            [module.id],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            }
          );
        });
        return { ...module, lessons };
      })
    );

    console.log('✅ Modules récupérés:', modulesWithLessons.length);
    res.json(modulesWithLessons);
  } catch (error) {
    console.error('❌ Erreur récupération modules:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/courses/category/:category
 * Cours par catégorie
 */
router.get('/category/:category', async (req, res) => {
  try {
    const courses = await Course.findByCategory(req.params.category);
    res.json(courses);
  } catch (error) {
    console.error('❌ Erreur récupération cours par catégorie:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;