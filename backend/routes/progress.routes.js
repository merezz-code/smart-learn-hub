// backend/routes/progress.routes.js
import express from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/progress/user/:userId/course/:courseId
 * Récupérer la progression d'un utilisateur pour un cours
 */
router.get('/user/:userId/course/:courseId', authenticateToken, async (req, res) => {
  const { userId, courseId } = req.params;
  
  // Vérifier que l'utilisateur accède à sa propre progression (sauf admin)
  if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  
  console.log('📊 Récupération progression:', { userId, courseId });
  
  try {
    const progress = await new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM user_progress 
         WHERE user_id = ? AND course_id = ?
         ORDER BY created_at DESC`,
        [userId, courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    console.log('✅ Progression récupérée:', progress.length, 'entrées');
    res.json(progress);
  } catch (error) {
    console.error('❌ Erreur récupération progression:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/progress/complete
 * Marquer une leçon comme complétée
 */
router.post('/complete', authenticateToken, async (req, res) => {
  const { userId, courseId, lessonId } = req.body;
  
  // Vérifier que l'utilisateur marque sa propre progression
  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  
  if (!userId || !courseId) {
    return res.status(400).json({ error: 'userId et courseId requis' });
  }
  
  console.log('✅ Marquer progression:', { userId, courseId, lessonId });
  
  try {
    // Vérifier si la progression existe déjà
    const existing = await new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM user_progress 
         WHERE user_id = ? AND course_id = ? AND lesson_id ${lessonId ? '= ?' : 'IS NULL'}`,
        lessonId ? [userId, courseId, lessonId] : [userId, courseId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      // Mettre à jour
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE user_progress 
           SET completed = 1, 
               completed_at = ?,
               updated_at = ?
           WHERE id = ?`,
          [new Date().toISOString(), new Date().toISOString(), existing.id],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    } else {
      // Créer
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO user_progress 
           (user_id, course_id, lesson_id, completed, completed_at, created_at) 
           VALUES (?, ?, ?, 1, ?, ?)`,
          [userId, courseId, lessonId || null, new Date().toISOString(), new Date().toISOString()],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    res.json({ 
      success: true, 
      message: lessonId ? 'Leçon marquée comme complétée' : 'Progression mise à jour' 
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde progression:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/progress/enroll
 * Inscrire un utilisateur à un cours
 */
router.post('/enroll', authenticateToken, async (req, res) => {
  const { userId, courseId } = req.body;
  
  // Vérifier que l'utilisateur s'inscrit lui-même
  if (req.user.id !== userId) {
    return res.status(403).json({ error: 'Accès interdit' });
  }
  
  if (!userId || !courseId) {
    return res.status(400).json({ error: 'userId et courseId requis' });
  }
  
  console.log('📝 Inscription au cours:', { userId, courseId });
  
  try {
    // Vérifier que le cours existe
    const course = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!course) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    if (!course.published) {
      return res.status(403).json({ error: 'Ce cours n\'est pas disponible' });
    }

    // Vérifier si déjà inscrit
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM user_progress WHERE user_id = ? AND course_id = ? AND lesson_id IS NULL',
        [userId, courseId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      return res.json({ 
        success: true, 
        message: 'Déjà inscrit à ce cours',
        already_enrolled: true 
      });
    }

    // Créer l'entrée d'inscription
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO user_progress 
         (user_id, course_id, lesson_id, completed, created_at) 
         VALUES (?, ?, NULL, 0, ?)`,
        [userId, courseId, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Incrémenter le compteur d'étudiants du cours
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE courses SET students_count = students_count + 1 WHERE id = ?',
        [courseId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ 
      success: true, 
      message: 'Inscription réussie',
      course_id: courseId 
    });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;