// backend/models/Question.js
import db from '../src/db.js';

class Question {
  static async create(questionData) {
    const {
      quiz_id,
      question_text,
      correct_answer,
      options,
      points,
      explanation
    } = questionData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO questions (
          quiz_id, question_text, correct_answer, options, points, explanation
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          quiz_id,
          question_text,
          correct_answer,
          JSON.stringify(options),
          points || 1,
          explanation
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...questionData });
        }
      );
    });
  }

  static async findByQuizId(quizId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM questions WHERE quiz_id = ? ORDER BY id`,
        [quizId],
        (err, rows) => {
          if (err) reject(err);
          else {
            // Parser les options JSON
            const parsed = (rows || []).map(row => ({
              ...row,
              options: JSON.parse(row.options)
            }));
            resolve(parsed);
          }
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM questions WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else {
            if (row) {
              row.options = JSON.parse(row.options);
            }
            resolve(row);
          }
        }
      );
    });
  }

  static async update(id, questionData) {
    const {
      question_text,
      correct_answer,
      options,
      points,
      explanation
    } = questionData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE questions SET
          question_text = ?,
          correct_answer = ?,
          options = ?,
          points = ?,
          explanation = ?
        WHERE id = ?`,
        [
          question_text,
          correct_answer,
          JSON.stringify(options),
          points,
          explanation,
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...questionData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM questions WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async deleteByQuizId(quizId) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM questions WHERE quiz_id = ?`,
        [quizId],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async countByQuiz(quizId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?`,
        [quizId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
  }
}

export default Question;