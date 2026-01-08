import express from 'express';
import { openDB } from '../src/db.js';

const router = express.Router();

router.post('/complete', async (req, res) => {
  try {
    const { userId, courseId, lessonId } = req.body;
    const db = await openDB();

    // Vérifier si la ligne existe déjà
    const existing = await db.get(
      `SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ?`,
      [userId, lessonId]
    );

    if (existing) {
      // Update
      await db.run(
        `UPDATE user_progress 
         SET completed = 1, completed_at = ? 
         WHERE id = ?`,
        [new Date().toISOString(), existing.id]
      );
      res.json({ success: true, id: existing.id });
    } else {
      // Insert
      const result = await db.run(
        `INSERT INTO user_progress 
         (user_id, course_id, lesson_id, completed, completed_at)
         VALUES (?, ?, ?, 1, ?)`,
        [userId, courseId, lessonId, new Date().toISOString()]
      );
      res.json({ success: true, id: result.lastID });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;


// import express from 'express';
// import db from '../src/db.js';

// const router = express.Router();

// router.post('/complete', async (req, res) => {
//   try {
//     const { userId, courseId, lessonId } = req.body;
    
//     db.run(
//       `INSERT OR REPLACE INTO user_progress (user_id, course_id, lesson_id, completed, completed_at) 
//        VALUES (?, ?, ?, 1, ?)`,
//       [userId, courseId, lessonId, new Date().toISOString()],
//       function(err) {
//         if (err) return res.status(500).json({ error: err.message });
//         res.json({ success: true, id: this.lastID });
//       }
//     );
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;