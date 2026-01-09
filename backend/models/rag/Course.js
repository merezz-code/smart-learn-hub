// backend/models/rag/Course.js
import db from '../../src/db.js';

class Course {
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM courses WHERE published = 1 ORDER BY created_at DESC`,
        [],
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
        `SELECT * FROM courses WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async create(courseData) {
    const {
      title,
      description,
      short_description,
      category,
      level,
      duration,
      instructor,
      thumbnail,
      price,
      published,
      rating,
      students_count,
      language,
      content
    } = courseData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO courses (
          title, description, short_description, category, level, duration,
          instructor, thumbnail, price, published, rating, students_count,
          language, content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          short_description,
          category,
          level,
          duration || 0,
          instructor,
          thumbnail,
          price || 0,
          published !== undefined ? published : 1,
          rating,
          students_count || 0,
          language || 'fr',
          content
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...courseData });
        }
      );
    });
  }

  static async update(id, courseData) {
    const {
      title,
      description,
      short_description,
      category,
      level,
      duration,
      instructor,
      thumbnail,
      price,
      published,
      rating,
      students_count,
      language,
      content
    } = courseData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE courses SET
          title = ?,
          description = ?,
          short_description = ?,
          category = ?,
          level = ?,
          duration = ?,
          instructor = ?,
          thumbnail = ?,
          price = ?,
          published = ?,
          rating = ?,
          students_count = ?,
          language = ?,
          content = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          title,
          description,
          short_description,
          category,
          level,
          duration,
          instructor,
          thumbnail,
          price,
          published,
          rating,
          students_count,
          language,
          content,
          id
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...courseData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM courses WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async findByCategory(category) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM courses WHERE category = ? AND published = 1`,
        [category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async findByLevel(level) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM courses WHERE level = ? AND published = 1`,
        [level],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async search(query) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM courses 
         WHERE (title LIKE ? OR description LIKE ?) 
         AND published = 1`,
        [`%${query}%`, `%${query}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  static async incrementStudentCount(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE courses 
         SET students_count = students_count + 1 
         WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes });
        }
      );
    });
  }
}

export default Course;