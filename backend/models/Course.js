// backend/models/Course.js
import db from '../config/database.js';

class Course {
  /**
   * Récupérer tous les cours publiés
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          c.*,
          (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as modules_count,
          (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
          (SELECT SUM(duration) FROM lessons WHERE course_id = c.id) as total_duration
        FROM courses c 
        WHERE published = 1 
        ORDER BY created_at DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Récupérer TOUS les cours (admin)
   */
  static async findAllIncludingDrafts() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          c.*,
          (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as modules_count,
          (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
          (SELECT SUM(duration) FROM lessons WHERE course_id = c.id) as total_duration
        FROM courses c 
        ORDER BY created_at DESC`,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Trouver un cours par ID
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          c.*,
          (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as modules_count,
          (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count
        FROM courses c 
        WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Créer un nouveau cours
   */
  static async create(courseData) {
    const {
      title,
      description,
      short_description,
      category,
      level,
      duration = 0,
      instructor,
      instructor_avatar,
      thumbnail,
      price = 0,
      published = true,
      rating,
      language = 'fr'
    } = courseData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO courses (
          title, description, short_description, category, level, duration,
          instructor, instructor_avatar, thumbnail, price, published, rating, 
          language, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          short_description,
          category,
          level,
          duration,
          instructor,
          instructor_avatar,
          thumbnail,
          price,
          published ? 1 : 0,
          rating,
          language,
          new Date().toISOString()
        ],
        function(err) {
          if (err) {
            console.error('❌ Erreur création cours:', err);
            reject(err);
          } else {
            console.log('✅ Cours créé avec ID:', this.lastID);
            resolve({ id: this.lastID, ...courseData });
          }
        }
      );
    });
  }

  /**
   * Mettre à jour un cours
   */
  static async update(id, courseData) {
    const {
      title,
      description,
      short_description,
      category,
      level,
      duration,
      instructor,
      instructor_avatar,
      thumbnail,
      price,
      published,
      rating,
      language
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
          instructor_avatar = ?,
          thumbnail = ?,
          price = ?,
          published = ?,
          rating = ?,
          language = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          title,
          description,
          short_description,
          category,
          level,
          duration,
          instructor,
          instructor_avatar,
          thumbnail,
          price,
          published !== undefined ? (published ? 1 : 0) : undefined,
          rating,
          language,
          new Date().toISOString(),
          id
        ],
        function(err) {
          if (err) {
            console.error('❌ Erreur modification cours:', err);
            reject(err);
          } else if (this.changes === 0) {
            reject(new Error('Cours non trouvé'));
          } else {
            console.log('✅ Cours modifié:', id);
            resolve({ id, ...courseData });
          }
        }
      );
    });
  }

  /**
   * Publier/Dépublier un cours
   */
  static async togglePublish(id, published) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE courses SET published = ?, updated_at = ? WHERE id = ?',
        [published ? 1 : 0, new Date().toISOString(), id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Cours non trouvé'));
          else resolve({ id, published });
        }
      );
    });
  }

  /**
   * Supprimer un cours
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM courses WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Cours non trouvé'));
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  /**
   * Trouver par catégorie
   */
  static async findByCategory(category) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM courses WHERE category = ? AND published = 1 ORDER BY created_at DESC',
        [category],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Rechercher des cours
   */
  static async search(query) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM courses 
         WHERE (title LIKE ? OR description LIKE ? OR instructor LIKE ?) 
         AND published = 1
         ORDER BY created_at DESC`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Incrémenter le nombre d'étudiants
   */
  static async incrementStudentCount(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE courses SET students_count = students_count + 1 WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ updated: this.changes });
        }
      );
    });
  }

  /**
   * Compter les cours
   */
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM courses WHERE 1=1';
    const params = [];

    if (filters.published !== undefined) {
      query += ' AND published = ?';
      params.push(filters.published ? 1 : 0);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }
}

export default Course;