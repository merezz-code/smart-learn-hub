// backend/models/CourseModule.js
import db from '../config/database.js';

class CourseModule {
  static async create(moduleData) {
    const { course_id, title, description, order_index } = moduleData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO course_modules (course_id, title, description, order_index) 
         VALUES (?, ?, ?, ?)`,
        [course_id, title, description || null, order_index || 0],
        function(err) {
          if (err) {
            console.error('❌ Erreur SQL création module:', err);
            reject(err);
          } else {
            console.log('✅ Module créé avec ID:', this.lastID);
            resolve({ id: this.lastID, ...moduleData });
          }
        }
      );
    });
  }

  static async findByCourseId(courseId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM course_modules 
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
        `SELECT * FROM course_modules WHERE id = ?`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  static async update(id, moduleData) {
    const { title, description, order_index } = moduleData;
    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE course_modules 
         SET title = ?, description = ?, order_index = ?
         WHERE id = ?`,
        [title, description, order_index, id],
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...moduleData });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM course_modules WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  static async getWithLessons(courseId) {
    console.log('🔍 getWithLessons pour cours:', courseId);
    
    const modules = await this.findByCourseId(courseId);
    console.log('📦 Modules trouvés:', modules.length);
    
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await new Promise((resolve, reject) => {
          db.all(
            `SELECT * FROM lessons 
             WHERE module_id = ? 
             ORDER BY order_index ASC`,
            [module.id],
            (err, rows) => {
              if (err) reject(err);
              else {
                console.log(`  📝 Module "${module.title}" (ID: ${module.id}): ${rows?.length || 0} leçons`);
                resolve(rows || []);
              }
            }
          );
        });
        
        return { ...module, lessons };
      })
    );
    
    return modulesWithLessons;
  }
}

export default CourseModule;