import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Utilitaire pour utiliser await avec SQLite
const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

router.get('/:id/stats', async (req, res) => {
  const userId = req.params.id;
  try {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT course_id) as total_courses,
        COUNT(DISTINCT CASE WHEN completed = 1 THEN course_id END) as completed_courses,
        AVG(CASE WHEN score > 0 THEN score END) as average_score
      FROM user_progress 
      WHERE user_id = ?`;

    const stats = await dbGet(statsQuery, [userId]);

    res.json({
      user_id: userId,
      total_courses: stats.total_courses || 0,
      completed_courses: stats.completed_courses || 0,
      in_progress_courses: stats.total_courses || 0,
      average_score: stats.average_score || 0,
      total_time_spent: 0,
      current_streak: 1,
      badges: []
    });
  } catch (error) {
    console.error('❌ Erreur SQLite Stats:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/enrolled-courses', async (req, res) => {
  const userId = req.params.id;
  try {
    // Note: SQLite utilise une syntaxe simple pour les jointures
    const query = `
      SELECT c.*, p.completed, p.score, p.updated_at as last_accessed
      FROM courses c
      INNER JOIN user_progress p ON c.id = p.course_id
      WHERE p.user_id = ?`;

    const courses = await dbAll(query, [userId]);
    
    const formatted = courses.map(c => ({
      course: {
        ...c,
        id: c.id.toString(), // Important pour le frontend
        published: !!c.published
      },
      progress: {
        user_id: userId,
        course_id: c.id,
        overall_progress: c.completed ? 100 : 0,
        status: c.completed ? 'completed' : 'in-progress'
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error('❌ Erreur SQLite Enrolled:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});
// backend/routes/dash.routes.js

router.get('/:id/weekly-activity', async (req, res) => {
  const userId = req.params.id;
  try {
    // Cette requête récupère la somme du temps par jour pour les 7 derniers jours
    const query = `
      SELECT 
        strftime('%w', updated_at) as day_of_week, 
        SUM(time_spent) as total_minutes
      FROM user_progress
      WHERE user_id = ? AND updated_at >= date('now', '-7 days')
      GROUP BY day_of_week`;

    const rows = await dbAll(query, [userId]);
    
    // On initialise un tableau de 7 jours (0=Dimanche, 1=Lundi, etc. pour SQLite)
    const activityMap = {};
    rows.forEach(row => {
      activityMap[Number(row.day_of_week)] = Number(row.total_minutes);

    });
    console.log('📅 Weekly activity for user', userId, activityMap);

    res.json(activityMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;