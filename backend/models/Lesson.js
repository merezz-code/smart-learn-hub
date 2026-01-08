// backend/models/Lesson.js
import db from '../src/db.js';

class Lesson {
  static async create(lessonData) {
    const {
      course_id,
      title,
      description,
      content,
      video_url,
      order_index,
      duration
    } = lessonData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO lessons (
          course_id, title, description, content, video_url, order_index, duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          course_id,
          title,
          description,
          content,
          video_url,
          order_index || 0,
          duration || 0
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...lessonData });
        }
      );
    });
  }

  static async findByCourseId(courseId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM lessons 
         WHERE course_id = ? 
         ORDER BY order_index ASC`,
        [courseId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM lessons WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async update(id, lessonData) {
    const {
      title,
      description,
      content,
      video_url,
      order_index,
      duration
    } = lessonData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE lessons SET
          title = ?,
          description = ?,
          content = ?,
          video_url = ?,
          order_index = ?,
          duration = ?
        WHERE id = ?`,
        [
          title,
          description,
          content,
          video_url,
          order_index,
          duration,
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...lessonData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM lessons WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async getNextLesson(courseId, currentOrderIndex) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM lessons 
         WHERE course_id = ? AND order_index > ? 
         ORDER BY order_index ASC 
         LIMIT 1`,
        [courseId, currentOrderIndex],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async getPreviousLesson(courseId, currentOrderIndex) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM lessons 
         WHERE course_id = ? AND order_index < ? 
         ORDER BY order_index DESC 
         LIMIT 1`,
        [courseId, currentOrderIndex],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async countByCourse(courseId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as count FROM lessons WHERE course_id = ?`,
        [courseId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row?.count || 0);
        }
      );
    });
  }
}

export default Lesson;