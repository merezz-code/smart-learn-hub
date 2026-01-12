// backend/models/Lesson.js
import db from '../config/database.js';

class Lesson {
  static async create(lessonData) {
    const {
      course_id,
      module_id,
      title,
      description,
      content,
      content_type,
      video_url,
      video_file,
      order_index,
      duration,
      is_free_preview
    } = lessonData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO lessons (
          course_id, module_id, title, description, content, 
          content_type, video_url, video_file, order_index, duration, is_free_preview
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course_id,
          module_id || null,
          title,
          description || null,
          content || null,
          content_type || 'text',
          video_url || null,
          video_file || null,
          order_index || 0,
          duration || 0,
          is_free_preview || 0
        ],
        function(err) {
          if (err) {
            console.error('❌ Erreur SQL création leçon:', err);
            reject(err);
          } else {
            console.log('✅ Leçon créée avec ID:', this.lastID);
            resolve({ id: this.lastID, ...lessonData });
          }
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

  static async findByModuleId(moduleId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM lessons 
         WHERE module_id = ? 
         ORDER BY order_index ASC`,
        [moduleId],
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
      content_type,
      video_url,
      video_file,
      order_index,
      duration,
      is_free_preview
    } = lessonData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE lessons SET
          title = ?,
          description = ?,
          content = ?,
          content_type = ?,
          video_url = ?,
          video_file = ?,
          order_index = ?,
          duration = ?,
          is_free_preview = ?
        WHERE id = ?`,
        [
          title,
          description,
          content,
          content_type,
          video_url,
          video_file,
          order_index,
          duration,
          is_free_preview,
          id
        ],
        function(err) {
          if (err) {
            console.error('❌ Erreur SQL modification leçon:', err);
            reject(err);
          } else {
            console.log('✅ Leçon modifiée:', id);
            resolve({ id, ...lessonData });
          }
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