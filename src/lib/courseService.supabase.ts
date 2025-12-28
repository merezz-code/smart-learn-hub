// src/lib/courseService.supabase.ts - VERSION EXACTE POUR VOTRE SCHÉMA
import { supabase } from './supabase';

// ==================== TYPES (adaptés à votre schéma exact) ====================

export interface Course {
  id: string;
  title: string;
  description: string;
  short_description?: string | null;
  thumbnail?: string | null;
  category: string;
  level: string;
  difficulty_level?: number | null;
  duration_hours?: number | null;
  objectives?: string[] | null;
  prerequisites?: string[] | null;
  published?: boolean | null;
  price?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  content: string | null;
  video_url: string | null;
  duration: number | null;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserNote {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// ==================== COURSE SERVICE ====================

class CourseService {
  // ==================== COURSES ====================

  /**
   * Récupérer tous les cours publiés
   */
  async getAllCourses(): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération cours:', error);
      return [];
    }
  }

  /**
   * Récupérer un cours par ID
   */
  async getCourseById(id: string): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération cours:', error);
      return null;
    }
  }

  /**
   * Créer un nouveau cours
   */
  async createCourse(courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<Course | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([{
          title: courseData.title,
          description: courseData.description,
          short_description: courseData.short_description || null,
          thumbnail: courseData.thumbnail || null,
          category: courseData.category,
          level: courseData.level,
          difficulty_level: courseData.difficulty_level || null,
          duration_hours: courseData.duration_hours || null,
          objectives: courseData.objectives || null,
          prerequisites: courseData.prerequisites || null,
          published: courseData.published ?? false,
          price: courseData.price || null
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Cours créé:', data?.title);
      return data;
    } catch (error) {
      console.error('❌ Erreur création cours:', error);
      return null;
    }
  }

  /**
   * Mettre à jour un cours
   */
  async updateCourse(id: string, updates: Partial<Course>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Cours mis à jour');
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour cours:', error);
      return false;
    }
  }

  /**
   * Supprimer un cours
   */
  async deleteCourse(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Cours supprimé');
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression cours:', error);
      return false;
    }
  }

  /**
   * Rechercher des cours par titre ou description
   */
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('published', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur recherche cours:', error);
      return [];
    }
  }

  /**
   * Filtrer les cours par catégorie
   */
  async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('category', category)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur filtrage par catégorie:', error);
      return [];
    }
  }

  /**
   * Filtrer les cours par niveau
   */
  async getCoursesByLevel(level: string): Promise<Course[]> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('level', level)
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur filtrage par niveau:', error);
      return [];
    }
  }

  // ==================== COURSE MODULES ====================

  /**
   * Récupérer les modules d'un cours
   */
  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération modules:', error);
      return [];
    }
  }

  /**
   * Créer un module
   */
  async createModule(module: Omit<CourseModule, 'id' | 'created_at' | 'updated_at'>): Promise<CourseModule | null> {
    try {
      const { data, error } = await supabase
        .from('course_modules')
        .insert([module])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Module créé:', data?.title);
      return data;
    } catch (error) {
      console.error('❌ Erreur création module:', error);
      return null;
    }
  }

  // ==================== LESSONS ====================

  /**
   * Récupérer toutes les leçons d'un cours
   */
  async getCourseLessons(courseId: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération leçons:', error);
      return [];
    }
  }

  /**
   * Récupérer les leçons d'un module spécifique
   */
  async getModuleLessons(moduleId: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération leçons du module:', error);
      return [];
    }
  }

  /**
   * Récupérer une leçon par ID
   */
  async getLessonById(id: string): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur récupération leçon:', error);
      return null;
    }
  }

  /**
   * Créer une leçon
   */
  async createLesson(lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson | null> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([lesson])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Leçon créée:', data?.title);
      return data;
    } catch (error) {
      console.error('❌ Erreur création leçon:', error);
      return null;
    }
  }

  /**
   * Mettre à jour une leçon
   */
  async updateLesson(id: string, updates: Partial<Lesson>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      console.log('✅ Leçon mise à jour');
      return true;
    } catch (error) {
      console.error('❌ Erreur mise à jour leçon:', error);
      return false;
    }
  }

  // ==================== ENROLLMENTS ====================

  /**
   * S'inscrire à un cours
   */
  async enrollInCourse(courseId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ Non authentifié - inscription impossible');
        return false;
      }

      const { error } = await supabase
        .from('enrollments')
        .insert([{
          user_id: user.id,
          course_id: courseId
        }]);

      if (error) {
        if (error.message.includes('duplicate')) {
          console.log('ℹ️ Déjà inscrit à ce cours');
          return true;
        }
        throw error;
      }

      console.log('✅ Inscription réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur inscription cours:', error);
      return false;
    }
  }

  /**
   * Se désinscrire d'un cours
   */
  async unenrollFromCourse(courseId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId);

      if (error) throw error;
      console.log('✅ Désinscription réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur désinscription:', error);
      return false;
    }
  }

  /**
   * Récupérer les cours auxquels l'utilisateur est inscrit
   */
  async getEnrolledCourses(): Promise<Course[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id, courses(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      // @ts-ignore - Supabase nested select
      return data?.map(item => item.courses).filter(Boolean) || [];
    } catch (error) {
      console.error('❌ Erreur récupération inscriptions:', error);
      return [];
    }
  }

  /**
   * Vérifier si l'utilisateur est inscrit à un cours
   */
  async isEnrolled(courseId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      return false;
    }
  }

  // ==================== PROGRESS ====================

  /**
   * Marquer une leçon comme complétée
   */
  async markLessonComplete(courseId: string, lessonId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('⚠️ Non authentifié - progression impossible');
        return 0;
      }

      // Upsert : insert ou update si existe déjà
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: courseId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      // Calculer et retourner la progression globale
      const progress = await this.calculateCourseProgress(user.id, courseId);
      console.log(`✅ Leçon complétée - Progression: ${progress}%`);
      return progress;
    } catch (error) {
      console.error('❌ Erreur marquage leçon:', error);
      return 0;
    }
  }

  /**
   * Calculer la progression d'un cours (% de leçons complétées)
   */
  private async calculateCourseProgress(userId: string, courseId: string): Promise<number> {
    try {
      // Compter le nombre total de leçons du cours
      const { data: totalLessons, error: totalError } = await supabase
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId);

      if (totalError) throw totalError;
      const total = totalLessons ? parseInt(totalLessons as unknown as string) : 0;

      if (total === 0) return 0;

      // Compter les leçons complétées par l'utilisateur
      const { data: completedLessons, error: completedError } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (completedError) throw completedError;
      const completed = completedLessons ? parseInt(completedLessons as unknown as string) : 0;

      return Math.round((completed / total) * 100);
    } catch (error) {
      console.error('❌ Erreur calcul progression:', error);
      return 0;
    }
  }

  /**
   * Récupérer la progression globale d'un cours
   */
  async getCourseProgress(courseId: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      return await this.calculateCourseProgress(user.id, courseId);
    } catch (error) {
      console.error('❌ Erreur récupération progression:', error);
      return 0;
    }
  }

  /**
   * Vérifier si une leçon est complétée
   */
  async isLessonCompleted(lessonId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('completed')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.completed || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Récupérer la liste des IDs des leçons complétées d'un cours
   */
  async getCompletedLessonIds(courseId: string): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .eq('completed', true);

      if (error) throw error;
      return data?.map(item => item.lesson_id) || [];
    } catch (error) {
      console.error('❌ Erreur récupération leçons complétées:', error);
      return [];
    }
  }

  // ==================== REVIEWS ====================

  /**
   * Ajouter un avis sur un cours
   */
  async addReview(courseId: string, rating: number, comment: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('course_reviews')
        .insert([{
          course_id: courseId,
          user_id: user.id,
          rating,
          comment
        }]);

      if (error) throw error;
      console.log('✅ Avis ajouté');
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout avis:', error);
      return false;
    }
  }

  /**
   * Récupérer les avis d'un cours
   */
  async getCourseReviews(courseId: string): Promise<CourseReview[]> {
    try {
      const { data, error } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération avis:', error);
      return [];
    }
  }

  // ==================== NOTES ====================

  /**
   * Ajouter une note sur une leçon
   */
  async addNote(lessonId: string, content: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_notes')
        .insert([{
          user_id: user.id,
          lesson_id: lessonId,
          content
        }]);

      if (error) throw error;
      console.log('✅ Note ajoutée');
      return true;
    } catch (error) {
      console.error('❌ Erreur ajout note:', error);
      return false;
    }
  }

  /**
   * Récupérer les notes d'une leçon
   */
  async getLessonNotes(lessonId: string): Promise<UserNote[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération notes:', error);
      return [];
    }
  }

  // ==================== DASHBOARD STATS ====================

  /**
   * Récupérer les statistiques du dashboard utilisateur
   */
  async getDashboardStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          enrolledCourses: 0,
          completedLessons: 0,
          totalLessons: 0,
          completionRate: 0
        };
      }

      // Récupérer les cours inscrits
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);

      const enrolledCount = enrollments?.length || 0;

      if (enrolledCount === 0) {
        return {
          enrolledCourses: 0,
          completedLessons: 0,
          totalLessons: 0,
          completionRate: 0
        };
      }

      // Récupérer toutes les leçons des cours inscrits
      let totalLessons = 0;
      const courseIds = enrollments!.map(e => e.course_id);
      
      for (const courseId of courseIds) {
        const lessons = await this.getCourseLessons(courseId);
        totalLessons += lessons.length;
      }

      // Compter les leçons complétées
      const { data: completedData } = await supabase
        .from('lesson_progress')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('completed', true)
        .in('course_id', courseIds);

      const completedCount = completedData?.length || 0;

      const completionRate = totalLessons > 0 
        ? Math.round((completedCount / totalLessons) * 100) 
        : 0;

      return {
        enrolledCourses: enrolledCount,
        completedLessons: completedCount,
        totalLessons,
        completionRate
      };
    } catch (error) {
      console.error('❌ Erreur stats dashboard:', error);
      return {
        enrolledCourses: 0,
        completedLessons: 0,
        totalLessons: 0,
        completionRate: 0
      };
    }
  }

  // ==================== QUIZ ====================

async getQuizById(id: string) {
  try {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (quizError) throw quizError;
    if (!quiz) throw new Error('Quiz non trouvé');

    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', id)
      .order('order_index', { ascending: true });

    if (questionsError) throw questionsError;

    const questionsWithAnswers = await Promise.all(
      (questions || []).map(async (question) => {
        const { data: answers } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('question_id', question.id)
          .order('order_index', { ascending: true });

        return {
          ...question,
          answers: answers || []
        };
      })
    );

    return {
      id: quiz.id,
      courseId: quiz.course_id,
      lessonId: quiz.lesson_id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passing_score,
      timeLimit: quiz.time_limit,
      maxAttempts: quiz.max_attempts,
      showCorrectAnswers: quiz.show_correct_answers,
      questions: questionsWithAnswers.map(q => ({
        id: q.id,
        questionText: q.question_text,
        type: q.question_type,
        points: q.points,
        explanation: q.explanation,
        answers: q.answers.map(a => ({
          id: a.id,
          text: a.answer_text,
          isCorrect: a.is_correct
        }))
      }))
    };
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    throw error;
  }
}

async saveQuizResult(result: any) {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .insert([{
        user_id: result.userId,
        quiz_id: result.quizId,
        course_id: result.courseId,
        score: result.score,
        points: result.points,
        total_points: result.totalPoints,
        passed: result.passed,
        attempt_number: result.attemptNumber,
        answers: result.answers,
        started_at: result.startedAt.toISOString(),
        completed_at: result.completedAt.toISOString(),
        time_spent: result.timeSpent
      }]);

    if (error) throw error;
    console.log('✅ Résultat sauvegardé');
    return true;
  } catch (error) {
    console.error('❌ Erreur sauvegarde:', error);
    return false;
  }
}

async getUserQuizResults(userId: string, quizId: string) {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Erreur résultats:', error);
    return [];
  }
}
}

// Export singleton
export const courseService = new CourseService();
export default courseService;