// backend/models/UserProgress.js
import db from '../src/db.js';

class UserProgress {
  static async create(progressData) {
    const {
      user_id,
      course_id,
      lesson_id,
      quiz_id,
      completed,
      score
    } = progressData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO user_progress (
          user_id, course_id, lesson_id, quiz_id, completed, score, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          course_id,
          lesson_id,
          quiz_id,
          completed || 0,
          score,
          completed ? new Date().toISOString() : null
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...progressData });
        }
      );
    });
  }

  static async findByUserAndCourse(userId, courseId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM user_progress 
         WHERE user_id = ? AND course_id = ?`,
        [userId, courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async findByUserAndLesson(userId, lessonId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM user_progress 
         WHERE user_id = ? AND lesson_id = ?`,
        [userId, lessonId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async markLessonComplete(userId, courseId, lessonId) {
    return new Promise((resolve, reject) => {
      // Vérifier si existe déjà
      db.get(
        `SELECT id FROM user_progress 
         WHERE user_id = ? AND lesson_id = ?`,
        [userId, lessonId],
        (err, row) => {
          if (err) return reject(err);
          
          if (row) {
            // Update
            db.run(
              `UPDATE user_progress 
               SET completed = 1, completed_at = ? 
               WHERE id = ?`,
              [new Date().toISOString(), row.id],
              function(err) {
                if (err) reject(err);
                else resolve({ id: row.id, completed: true });
              }
            );
          } else {
            // Insert
            db.run(
              `INSERT INTO user_progress (
                user_id, course_id, lesson_id, completed, completed_at
              ) VALUES (?, ?, ?, 1, ?)`,
              [userId, courseId, lessonId, new Date().toISOString()],
              function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, completed: true });
              }
            );
          }
        }
      );
    });
  }

  static async markQuizComplete(userId, courseId, quizId, score) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO user_progress (
          user_id, course_id, quiz_id, completed, score, completed_at
        ) VALUES (?, ?, ?, 1, ?, ?)`,
        [userId, courseId, quizId, score, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, score });
        }
      );
    });
  }

  static async getCompletedLessons(userId, courseId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT lesson_id FROM user_progress 
         WHERE user_id = ? AND course_id = ? AND lesson_id IS NOT NULL AND completed = 1`,
        [userId, courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve((rows || []).map(r => r.lesson_id));
        }
      );
    });
  }

  static async getCourseProgress(userId, courseId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          COUNT(*) as completed_lessons,
          (SELECT COUNT(*) FROM lessons WHERE course_id = ?) as total_lessons
         FROM user_progress 
         WHERE user_id = ? AND course_id = ? AND lesson_id IS NOT NULL AND completed = 1`,
        [courseId, userId, courseId],
        (err, row) => {
          if (err) reject(err);
          else {
            const completed = row?.completed_lessons || 0;
            const total = row?.total_lessons || 1;
            const percentage = Math.round((completed / total) * 100);
            resolve({
              completed_lessons: completed,
              total_lessons: total,
              progress_percentage: percentage
            });
          }
        }
      );
    });
  }

  static async getQuizAttempts(userId, quizId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM user_progress 
         WHERE user_id = ? AND quiz_id = ? 
         ORDER BY completed_at DESC`,
        [userId, quizId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async getBestQuizScore(userId, quizId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT MAX(score) as best_score 
         FROM user_progress 
         WHERE user_id = ? AND quiz_id = ?`,
        [userId, quizId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.best_score || 0);
        }
      );
    });
  }
}

export default UserProgress;

// const db = require('../src/db');

// class UserProgress {
//   static async create(progressData) {
//     const { user_id, course_id, lesson_id, completed, score } = progressData;
//     return new Promise((resolve, reject) => {
//       db.run(
//         `INSERT INTO user_progress (user_id, course_id, lesson_id, completed, score, completed_at) 
//          VALUES (?, ?, ?, ?, ?, ?)`,
//         [user_id, course_id, lesson_id, completed || 0, score, completed ? new Date().toISOString() : null],
//         function(err) {
//           if (err) reject(err);
//           else resolve({ id: this.lastID, ...progressData });
//         }
//       );
//     });
//   }

//   static async findByUserAndCourse(userId, courseId) {
//     return new Promise((resolve, reject) => {
//       db.all(
//         `SELECT * FROM user_progress WHERE user_id = ? AND course_id = ?`,
//         [userId, courseId],
//         (err, rows) => {
//           if (err) reject(err);
//           else resolve(rows);
//         }
//       );
//     });
//   }

//   static async markLessonComplete(userId, courseId, lessonId) {
//     return new Promise((resolve, reject) => {
//       // Vérifier si existe déjà
//       db.get(
//         `SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ?`,
//         [userId, lessonId],
//         (err, row) => {
//           if (err) return reject(err);
          
//           if (row) {
//             // Update
//             db.run(
//               `UPDATE user_progress SET completed = 1, completed_at = ? WHERE id = ?`,
//               [new Date().toISOString(), row.id],
//               function(err) {
//                 if (err) reject(err);
//                 else resolve({ id: row.id, completed: true });
//               }
//             );
//           } else {
//             // Insert
//             db.run(
//               `INSERT INTO user_progress (user_id, course_id, lesson_id, completed, completed_at) 
//                VALUES (?, ?, ?, 1, ?)`,
//               [userId, courseId, lessonId, new Date().toISOString()],
//               function(err) {
//                 if (err) reject(err);
//                 else resolve({ id: this.lastID, completed: true });
//               }
//             );
//           }
//         }
//       );
//     });
//   }

//   static async getCompletedLessons(userId, courseId) {
//     return new Promise((resolve, reject) => {
//       db.all(
//         `SELECT lesson_id FROM user_progress 
//          WHERE user_id = ? AND course_id = ? AND completed = 1`,
//         [userId, courseId],
//         (err, rows) => {
//           if (err) reject(err);
//           else resolve(rows.map(r => r.lesson_id));
//         }
//       );
//     });
//   }
// }

// module.exports = UserProgress;