// backend/models/Quiz.js
import db from '../src/db.js';

class Quiz {
  static async create(quizData) {
    const {
      course_id,
      lesson_id,
      title,
      description,
      passing_score,
      time_limit,
      max_attempts
    } = quizData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO quizzes (
          course_id, lesson_id, title, description, 
          passing_score, time_limit, max_attempts
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          course_id,
          lesson_id,
          title,
          description,
          passing_score || 70,
          time_limit,
          max_attempts
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...quizData });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM quizzes WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByLessonId(lessonId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM quizzes WHERE lesson_id = ?`,
        [lessonId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async findByCourseId(courseId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM quizzes WHERE course_id = ?`,
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async update(id, quizData) {
    const {
      title,
      description,
      passing_score,
      time_limit,
      max_attempts
    } = quizData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE quizzes SET
          title = ?,
          description = ?,
          passing_score = ?,
          time_limit = ?,
          max_attempts = ?
        WHERE id = ?`,
        [
          title,
          description,
          passing_score,
          time_limit,
          max_attempts,
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...quizData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM quizzes WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async hasQuiz(lessonId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM quizzes WHERE lesson_id = ?`,
        [lessonId],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }
}

export default Quiz;