// backend/models/Question.js
import db from '../config/database.js';

class Question {
  static async create(questionData) {
    const {
      quiz_id,
      question_text,
      question_type = 'multiple_choice',
      correct_answer,
      options,
      points = 1,
      explanation,
      order_index = 0
    } = questionData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO questions (
          quiz_id, question_text, question_type, correct_answer, 
          options, points, explanation, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quiz_id,
          question_text,
          question_type, // ✅ Ajouté
          correct_answer,
          JSON.stringify(options),
          points,
          explanation || null,
          order_index // ✅ Ajouté
        ],
        function(err) {
          if (err) {
            console.error('❌ Erreur création question:', err);
            reject(err);
          } else {
            console.log('✅ Question créée avec ID:', this.lastID);
            resolve({ id: this.lastID, ...questionData });
          }
        }
      );
    });
  }

  static async findByQuizId(quizId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_index',
        [quizId],
        (err, rows) => {
          if (err) {
            console.error('❌ Erreur findByQuizId:', err);
            reject(err);
          } else {
            console.log(`✅ ${rows?.length || 0} questions trouvées pour quiz ${quizId}`);
            resolve(rows || []);
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
            if (row && row.options) {
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
      question_type = 'multiple_choice', // ✅ Valeur par défaut
      correct_answer,
      options,
      points = 1,
      explanation,
      order_index = 0 // ✅ Valeur par défaut
    } = questionData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE questions SET
          question_text = ?,
          question_type = ?,
          correct_answer = ?,
          options = ?,
          points = ?,
          explanation = ?,
          order_index = ?
        WHERE id = ?`,
        [
          question_text,
          question_type, // ✅ Ajouté
          correct_answer,
          JSON.stringify(options),
          points,
          explanation || null,
          order_index, // ✅ Ajouté
          id
        ],
        function(err) {
          if (err) {
            console.error('❌ Erreur mise à jour question:', err);
            reject(err);
          } else {
            console.log('✅ Question mise à jour:', id);
            resolve({ id, ...questionData });
          }
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
          if (err) {
            console.error('❌ Erreur suppression question:', err);
            reject(err);
          } else {
            console.log('✅ Question supprimée:', id);
            resolve({ deleted: this.changes });
          }
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
          if (err) {
            console.error('❌ Erreur suppression questions du quiz:', err);
            reject(err);
          } else {
            console.log('✅ Questions supprimées pour quiz:', quizId, '- Count:', this.changes);
            resolve({ deleted: this.changes });
          }
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