// src/lib/courseService.ts
import { backendAPI } from './api/backend';
import { Course, Lesson, Quiz } from '@/types/course';

class CourseService {
  // === COURSES ===
  async getAllCourses(): Promise<Course[]> {
    try {
      const data = await backendAPI.getCourses();
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ Aucun cours trouvé');
        return [];
      }
      return data.map(raw => this.transformCourse(raw));
    } catch (error) {
      console.error('❌ Erreur getAllCourses:', error);
      return [];
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const data = await backendAPI.getCourseById(id);
      if (!data) return null;
      return this.transformCourse(data);
    } catch (error) {
      console.error('❌ Erreur getCourseById:', error);
      return null;
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

  async updateLessonNotes(userId: string, courseId: string, lessonId: string, notes: string) {
    // TODO: Implémenter endpoint notes
    console.log('📝 Notes:', { userId, courseId, lessonId, notes });
  }

  // === TRANSFORMATEURS ===
  private transformCourse(raw: any): Course {
    return {
      id: raw.id?.toString() || '',
      title: raw.title || '',
      description: raw.description || '',
      shortDescription: raw.short_description,
      thumbnail: raw.thumbnail || raw.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      category: raw.category || 'programming',
      level: raw.level || 'beginner',
      duration: raw.duration || 0,
      instructor: raw.instructor,
      instructorAvatar: raw.instructor_avatar,
      rating: raw.rating,
      reviewsCount: raw.reviews_count,
      studentsCount: raw.students_count,
      objectives: raw.objectives ? JSON.parse(raw.objectives) : [],
      prerequisites: raw.prerequisites ? JSON.parse(raw.prerequisites) : [],
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
      published: !!raw.published,
      price: raw.price || 0,
      modules: raw.modules || [],
    };
  }

  private transformLesson(raw: any): Lesson {
    return {
      id: raw.id?.toString() || '',
      moduleId: raw.module_id?.toString() || '',
      courseId: raw.course_id?.toString() || '',
      title: raw.title || '',
      description: raw.description,
      order: raw.order_index || 0,
      duration: raw.duration || 0,
      content: raw.content || '',
      videoUrl: raw.video_url,
      videoThumbnail: raw.video_thumbnail,
      resources: raw.resources || [],
      hasQuiz: !!raw.has_quiz,
      quizId: raw.quiz_id?.toString(),
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
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
    };
  }
}

export const courseService = new CourseService();
export default courseService;
