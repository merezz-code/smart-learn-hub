import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import db from '../config/database.js';

/**
 * Récupère tous les cours avec leurs modules et leçons pour le RAG
 */
export async function getAllCourses() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT 
        c.id,
        c.title as course_title,
        c.description,
        c.short_description,
        c.category,
        c.level,
        m.id as module_id,
        m.title as module_title,
        l.id as lesson_id,
        l.title as lesson_title,
        l.content,
        l.duration
      FROM courses c
      LEFT JOIN course_modules m ON c.id = m.course_id
      LEFT JOIN lessons l ON m.id = l.module_id
      WHERE c.published = 1
      ORDER BY c.id, m.order_index, l.order_index`,
      [],
      (err, rows) => {
        if (err) {
          console.error('❌ Erreur récupération cours pour RAG:', err);
          reject(err);
        } else {
          // Regrouper les données par cours
          const coursesMap = new Map();
          
          rows.forEach(row => {
            if (!coursesMap.has(row.id)) {
              coursesMap.set(row.id, {
                id: row.id,
                course_title: row.course_title,
                description: row.description,
                short_description: row.short_description,
                category: row.category,
                level: row.level,
                content: ''
              });
            }
            
            const course = coursesMap.get(row.id);
            
            // Ajouter le contenu des leçons
            if (row.content) {
              course.content += `\n\n[Module: ${row.module_title}]\n[Leçon: ${row.lesson_title}]\n${row.content}`;
            }
          });
          
          const courses = Array.from(coursesMap.values());
          console.log(`✅ ${courses.length} cours récupérés pour le RAG`);
          resolve(courses);
        }
      }
    );
  });
}

/**
 * Récupère un cours spécifique avec tout son contenu
 */
export async function getCourseById(courseId) {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Cours non trouvé');
  }
  
  const modules = await CourseModule.getWithLessons(courseId);
  
  return {
    ...course,
    modules
  };
}