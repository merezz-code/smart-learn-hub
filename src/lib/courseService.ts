import { backendAPI } from './api/backend';
import { Course, Lesson, Quiz, UserStats, UserCourseProgress } from '@/types/course';

class CourseService {
  // === COURSES ===
  async getAllCourses(): Promise<Course[]> {
    try {
      const data = await backendAPI.getCourses();
      if (!data || !Array.isArray(data)) return [];
      return data.map(raw => this.transformCourse(raw));
    } catch (error) {
      console.error('❌ Erreur getAllCourses:', error);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const data = await backendAPI.getCourseById(id);
      return data ? this.transformCourse(data) : null;
    } catch (error) {
      return null;
    }
  }

  // === PROGRESS (Calculé localement pour éviter la 404) ===
  // === PROGRESS (Calculé localement via le nouveau Dash Route) ===
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Changement de l'URL pour correspondre à dash.routes.js
      const data = await backendAPI.request(`/dash/${userId}/stats`);

      return {
        userId,
        totalCourses: data.total_courses || 0,
        completedCourses: data.completed_courses || 0,
        inProgressCourses: data.in_progress_courses || 0,
        totalTimeSpent: data.total_time_spent || 0,
        averageScore: data.average_score || 0,
        badges: data.badges || [],
        currentStreak: data.current_streak || 1,
        longestStreak: data.longest_streak || 1,
        lastActivityDate: new Date(),
      };
    } catch (error) {
      console.error('❌ Erreur stats via dash:', error);
      return this.getDefaultStats(userId);
    }
  }

  async getUserQuizResults(userId: string, quizId: string) {
    try {
      console.log('📊 Chargement résultats quiz:', { userId, quizId });
      const results = await backendAPI.getUserQuizResults(userId, quizId);
      console.log('✅ Résultats trouvés:', results?.length || 0);
      return results || [];
    } catch (error) {
      console.error('❌ Erreur getUserQuizResults:', error);
      return [];
    }
  }

  async saveQuizResult(result: any) {
    try {
      console.log('💾 Sauvegarde résultats quiz:', result);
      const data = await backendAPI.saveQuizResult(result);
      console.log('✅ Résultats sauvegardés:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur saveQuizResult:', error);
      throw error;
    }
  }
  // === LESSONS ===
  async getLessonById(id: string): Promise<Lesson | null> {
    try {
      const data = await backendAPI.getLessonById(id);
      if (!data) return null;
      return this.transformLesson(data);
    } catch (error) {
      console.error('❌ Erreur getLessonById:', error);
      return null;
    }
  }

  // === QUIZZES ===
  async getQuizById(id: string): Promise<Quiz | null> {
    try {
      const data = await backendAPI.getQuizById(id);
      if (!data) return null;
      return this.transformQuiz(data);
    } catch (error) {
      console.error('❌ Erreur getQuizById:', error);
      return null;
    }
  }

  // === PROGRESS ===
  async markLessonComplete(userId: string, courseId: string, lessonId: string) {
    try {
      return await backendAPI.markLessonComplete(userId, courseId, lessonId);
    } catch (error) {
      console.error('❌ Erreur markLessonComplete:', error);
      throw error;
    }
  }

  async getLessonProgress(userId: string, courseId: string, lessonId: string) {
    try {
      const progress = await backendAPI.getUserProgress(userId, courseId);
      if (!progress || !Array.isArray(progress)) return null;
      return progress.find((p: any) => p.lesson_id === lessonId) || null;
    } catch (error) {
      console.error('❌ Erreur getLessonProgress:', error);
      return null;
    }
  }
  async getEnrolledCourses(userId: string): Promise<(Course & { progress: UserCourseProgress })[]> {
    try {
      // Changement de l'URL pour correspondre à dash.routes.js
      const data = await backendAPI.request(`/dash/${userId}/enrolled-courses`);

      if (!data || !Array.isArray(data)) return [];

      return data.map((item: any) => {
        // On transforme le cours contenu dans l'objet
        const course = this.transformCourse(item.course);

        return {
          ...course,
          progress: {
            id: `prog-${course.id}`,
            userId,
            courseId: course.id,
            status: item.progress.status,
            completedLessons: [], // Optionnel
            overallProgress: item.progress.overall_progress || 0,
            lastAccessedAt: new Date(),
            startedAt: new Date(),
            timeSpent: 0
          }
        };
      });
    } catch (error) {
      console.error('❌ Erreur enrolled-courses via dash:', error);
      return [];
    }
  }
  async getWeeklyActivity(userId: string): Promise<Record<number, number>> {
  try {
    const data = await backendAPI.request(`/dash/${userId}/weekly-activity`);

    // 🔥 conversion string -> number
    const parsed: Record<number, number> = {};
    Object.keys(data).forEach(key => {
      parsed[Number(key)] = data[key];
    });

    return parsed;
  } catch (error) {
    console.error('❌ Erreur weekly activity:', error);
    return {};
  }
}


  private getDefaultStats(userId: string): UserStats {
    return {
      userId, totalCourses: 0, completedCourses: 0, inProgressCourses: 0,
      totalTimeSpent: 0, averageScore: 0, badges: [], currentStreak: 0,
      longestStreak: 0, lastActivityDate: new Date()
    };
  }

  // === TRANSFORMATEURS ===
  private transformCourse(raw: any): Course {
    return {
      id: raw.id?.toString() || '',
      title: raw.title || 'Sans titre',
      description: raw.description || '',
      thumbnail: raw.thumbnail || raw.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      category: raw.category || 'Général',
      level: raw.level || 'beginner',
      duration: Number(raw.duration) || 0,
      instructor: raw.instructor || 'Instructeur',
      createdAt: new Date(raw.created_at || Date.now()),
      updatedAt: new Date(raw.updated_at || Date.now()),
      published: !!raw.published,
      price: Number(raw.price) || 0, // Force en nombre
      rating: Number(raw.rating) || 0, // 👈 AJOUTEZ CECI pour éviter le crash toFixed()
      modules: raw.modules || [],
    };
  }

  private transformLesson(raw: any): Lesson {
    return {
      id: raw.id?.toString() || '',
      moduleId: raw.module_id?.toString() || '',
      courseId: raw.course_id?.toString() || '',
      title: raw.title || '',
      order: raw.order_index || 0,
      duration: raw.duration || 0,
      content: raw.content || '',
      hasQuiz: !!raw.has_quiz,
      createdAt: new Date(raw.created_at || Date.now()),
      updatedAt: new Date(raw.updated_at || Date.now()),
    };
  }
  private transformQuiz(raw: any): Quiz {
    return {
      id: raw.id?.toString() || '',
      courseId: raw.course_id?.toString() || '',
      lessonId: raw.lesson_id?.toString(),
      title: raw.title || '',
      description: raw.description,
      passingScore: raw.passing_score || 70,
      timeLimit: raw.time_limit,
      maxAttempts: raw.max_attempts,
      questions: raw.questions || [],
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      createdAt: new Date(raw.created_at || Date.now()),
      updatedAt: new Date(raw.updated_at || Date.now()),
    };
  }
}

export const courseService = new CourseService();
export default courseService;