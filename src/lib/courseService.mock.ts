// src/lib/courseService.ts - VERSION TEMPORAIRE AVEC MOCK DATA
// Utilisez cette version pour tester SANS Supabase
// Une fois Supabase configuré, remplacez par la version complète

import { 
    Course, 
    Lesson, 
    Quiz, 
    QuizResult,
    UserCourseProgress,
    LessonProgress,
    UserStats,
    Certificate,
    ProgressStatus,
  } from '@/types/course';
  
  // Importer les données mock
  import { mockCourses, mockQuiz, mockUserStats } from '@/data/mockCourses';
  
  /**
   * Service pour gérer toutes les opérations liées aux cours
   * VERSION MOCK - Pour tester sans Supabase
   */
  class CourseService {
    
    // Simuler un délai réseau
    private delay(ms: number = 500) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    // Storage local simulé
    private storage = {
      progress: new Map<string, UserCourseProgress>(),
      lessonProgress: new Map<string, LessonProgress>(),
      quizResults: new Map<string, QuizResult[]>(),
    };
  
    // ==================== COURS ====================
    
    async getAllCourses(): Promise<Course[]> {
      await this.delay(300);
      return mockCourses;
    }
  
    async getCourseById(courseId: string): Promise<Course> {
      await this.delay(300);
      const course = mockCourses.find(c => c.id === courseId);
      if (!course) throw new Error('Cours non trouvé');
      return course;
    }
  
    async searchCourses(query: string, filters?: {
      category?: string;
      level?: string;
      minPrice?: number;
      maxPrice?: number;
    }): Promise<Course[]> {
      await this.delay(300);
      let results = [...mockCourses];
  
      if (query) {
        results = results.filter(c => 
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase())
        );
      }
  
      if (filters?.category) {
        results = results.filter(c => c.category === filters.category);
      }
  
      if (filters?.level) {
        results = results.filter(c => c.level === filters.level);
      }
  
      return results;
    }
  
    // ==================== INSCRIPTION ====================
  
    async enrollCourse(userId: string, courseId: string): Promise<UserCourseProgress> {
      await this.delay(300);
      
      const key = `${userId}-${courseId}`;
      const existing = this.storage.progress.get(key);
      
      if (existing) return existing;
  
      const progress: UserCourseProgress = {
        id: crypto.randomUUID(),
        userId,
        courseId,
        status: ProgressStatus.IN_PROGRESS,
        completedLessons: [],
        lastAccessedAt: new Date(),
        startedAt: new Date(),
        timeSpent: 0,
        overallProgress: 0,
      };
  
      this.storage.progress.set(key, progress);
      return progress;
    }
  
    async getEnrolledCourses(userId: string): Promise<(Course & { progress: UserCourseProgress })[]> {
      await this.delay(300);
      
      const enrolled: (Course & { progress: UserCourseProgress })[] = [];
      
      this.storage.progress.forEach((progress, key) => {
        if (key.startsWith(userId)) {
          const course = mockCourses.find(c => c.id === progress.courseId);
          if (course) {
            enrolled.push({ ...course, progress });
          }
        }
      });
  
      return enrolled;
    }
  
    // ==================== PROGRESSION ====================
  
    async getUserProgress(userId: string, courseId: string): Promise<UserCourseProgress | null> {
      await this.delay(200);
      const key = `${userId}-${courseId}`;
      return this.storage.progress.get(key) || null;
    }
  
    async updateCurrentLesson(userId: string, courseId: string, lessonId: string): Promise<void> {
      await this.delay(200);
      const key = `${userId}-${courseId}`;
      const progress = this.storage.progress.get(key);
      
      if (progress) {
        progress.currentLessonId = lessonId;
        progress.lastAccessedAt = new Date();
        this.storage.progress.set(key, progress);
      }
    }
  
    async markLessonComplete(userId: string, courseId: string, lessonId: string): Promise<void> {
      await this.delay(200);
      const key = `${userId}-${courseId}`;
      const progress = this.storage.progress.get(key);
      
      if (!progress) throw new Error('Progression non trouvée');
  
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
  
      const course = await this.getCourseById(courseId);
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      progress.overallProgress = (progress.completedLessons.length / totalLessons) * 100;
      progress.lastAccessedAt = new Date();
  
      this.storage.progress.set(key, progress);
  
      // Mettre à jour la progression de la leçon
      await this.updateLessonProgress(userId, courseId, lessonId, true);
    }
  
    async getLessonProgress(userId: string, courseId: string, lessonId: string): Promise<LessonProgress | null> {
      await this.delay(200);
      const key = `${userId}-${courseId}-${lessonId}`;
      return this.storage.lessonProgress.get(key) || null;
    }
  
    async updateLessonProgress(
      userId: string, 
      courseId: string, 
      lessonId: string, 
      completed: boolean,
      timeSpent?: number
    ): Promise<void> {
      await this.delay(200);
      const key = `${userId}-${courseId}-${lessonId}`;
      const existing = this.storage.lessonProgress.get(key);
  
      const lessonProgress: LessonProgress = existing || {
        id: crypto.randomUUID(),
        userId,
        lessonId,
        courseId,
        completed: false,
        timeSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      lessonProgress.completed = completed;
      lessonProgress.completedAt = completed ? new Date() : undefined;
      if (timeSpent !== undefined) {
        lessonProgress.timeSpent = timeSpent;
      }
      lessonProgress.updatedAt = new Date();
  
      this.storage.lessonProgress.set(key, lessonProgress);
    }
  
    async updateLessonNotes(
      userId: string, 
      courseId: string, 
      lessonId: string, 
      notes: string
    ): Promise<void> {
      await this.delay(200);
      const key = `${userId}-${courseId}-${lessonId}`;
      const existing = this.storage.lessonProgress.get(key);
  
      if (existing) {
        existing.notes = notes;
        existing.updatedAt = new Date();
        this.storage.lessonProgress.set(key, existing);
      } else {
        const lessonProgress: LessonProgress = {
          id: crypto.randomUUID(),
          userId,
          lessonId,
          courseId,
          completed: false,
          timeSpent: 0,
          notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.storage.lessonProgress.set(key, lessonProgress);
      }
    }
  
    // ==================== LEÇONS ====================
  
    async getLessonById(lessonId: string): Promise<Lesson> {
      await this.delay(200);
      
      for (const course of mockCourses) {
        for (const module of course.modules) {
          const lesson = module.lessons.find(l => l.id === lessonId);
          if (lesson) return lesson;
        }
      }
      
      throw new Error('Leçon non trouvée');
    }
  
    // ==================== QUIZ ====================
  
    async getQuizById(quizId: string): Promise<Quiz> {
      await this.delay(300);
      
      if (quizId === mockQuiz.id) {
        return mockQuiz;
      }
      
      throw new Error('Quiz non trouvé');
    }
  
    async saveQuizResult(result: QuizResult): Promise<void> {
      await this.delay(300);
      
      const key = `${result.userId}-${result.quizId}`;
      const results = this.storage.quizResults.get(key) || [];
      results.push(result);
      this.storage.quizResults.set(key, results);
    }
  
    async getUserQuizResults(userId: string, quizId: string): Promise<QuizResult[]> {
      await this.delay(200);
      const key = `${userId}-${quizId}`;
      return this.storage.quizResults.get(key) || [];
    }
  
    // ==================== STATISTIQUES ====================
  
    async getUserStats(userId: string): Promise<UserStats> {
      await this.delay(300);
      
      let totalCourses = 0;
      let completedCourses = 0;
      let inProgressCourses = 0;
      let totalTimeSpent = 0;
  
      this.storage.progress.forEach((progress, key) => {
        if (key.startsWith(userId)) {
          totalCourses++;
          if (progress.status === ProgressStatus.COMPLETED) {
            completedCourses++;
          } else if (progress.status === ProgressStatus.IN_PROGRESS) {
            inProgressCourses++;
          }
          totalTimeSpent += progress.timeSpent;
        }
      });
  
      // Calculer le score moyen
      let totalScore = 0;
      let quizCount = 0;
      this.storage.quizResults.forEach((results, key) => {
        if (key.startsWith(userId)) {
          results.forEach(result => {
            totalScore += result.score;
            quizCount++;
          });
        }
      });
  
      return {
        ...mockUserStats,
        userId,
        totalCourses,
        completedCourses,
        inProgressCourses,
        totalTimeSpent,
        averageScore: quizCount > 0 ? totalScore / quizCount : 0,
      };
    }
  
    // ==================== CERTIFICATS ====================
  
    async generateCertificate(userId: string, courseId: string): Promise<Certificate> {
      await this.delay(300);
      
      const course = await this.getCourseById(courseId);
      const progress = await this.getUserProgress(userId, courseId);
  
      if (!progress || progress.status !== ProgressStatus.COMPLETED) {
        throw new Error('Le cours doit être complété pour obtenir un certificat');
      }
  
      const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
      const certificate: Certificate = {
        id: crypto.randomUUID(),
        userId,
        courseId,
        courseName: course.title,
        studentName: 'Étudiant Test', // TODO: Récupérer le vrai nom
        score: progress.overallProgress,
        issuedAt: new Date(),
        verificationCode,
      };
  
      return certificate;
    }
  
    // ==================== AVIS ====================
  
    async addCourseReview(
      userId: string,
      courseId: string,
      rating: number,
      comment?: string
    ): Promise<void> {
      await this.delay(300);
      // Simulé - pas de stockage persistant
      console.log('Review added:', { userId, courseId, rating, comment });
    }
  
    async getCourseReviews(courseId: string): Promise<any[]> {
      await this.delay(300);
      return [];
    }
  }
  
  export const courseService = new CourseService();