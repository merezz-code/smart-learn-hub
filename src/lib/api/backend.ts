// src/lib/api/backend.ts - VERSION CORRIGÉE FINALE
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class BackendAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    //Récupérer le token JWT
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options?.headers,
        },
      });

      // ✅ Gérer l'expiration du token
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn('⚠️ Token expiré ou invalide - Redirection vers login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Rediriger vers la page de login (sauf si on est déjà dessus)
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        const error = await response.json();
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // === COURSES ===
  async getCourses() {
    console.log('📡 Récupération des cours...');
    return this.request('/courses');
  }

  async getCourseById(id: string) {
    console.log('📡 Récupération du cours:', id);
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: any) {
    console.log('📡 Création d\'un nouveau cours');
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any) {
    console.log('📡 Mise à jour du cours:', id);
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string) {
    console.log('📡 Suppression du cours:', id);
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // === LESSONS ===
  async getLessonsByCourse(courseId: string) {
    console.log('📡 Récupération des leçons du cours:', courseId);
    return this.request(`/lessons/course/${courseId}`);
  }

  async getLessonById(id: string) {
    console.log('📡 Récupération de la leçon:', id);
    return this.request(`/lessons/${id}`);
  }

  async createLesson(lessonData: any) {
    console.log('📡 Création d\'une nouvelle leçon');
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(id: string, lessonData: any) {
    console.log('📡 Mise à jour de la leçon:', id);
    return this.request(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(id: string) {
    console.log('📡 Suppression de la leçon:', id);
    return this.request(`/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  // === QUIZZES ===
  async getQuizById(id: string) {
    console.log('📡 Récupération du quiz:', id);
    return this.request(`/quizzes/${id}`);
  }

  async getQuizByLessonId(lessonId: string) {
    console.log('📡 Récupération du quiz de la leçon:', lessonId);
    return this.request(`/quizzes/lesson/${lessonId}`);
  }

  async getCourseQuizzes(courseId: string) {
    console.log('📡 Récupération des quiz du cours:', courseId);
    return this.request(`/quizzes/course/${courseId}`);
  }

  async createQuiz(quizData: any) {
    console.log('📡 Création d\'un nouveau quiz');
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async submitQuizAnswers(quizId: string, answers: any) {
    console.log('📡 Soumission des réponses du quiz:', quizId);
    return this.request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // ✅ NOUVEAU: Sauvegarder les résultats d'un quiz
  async saveQuizResult(result: any) {
    console.log('📡 Sauvegarde des résultats du quiz');
    return this.request('/quizzes/results', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }

  // ✅ NOUVEAU: Récupérer les résultats d'un utilisateur pour un quiz
  async getUserQuizResults(userId: string, quizId: string) {
    console.log('📡 Récupération des résultats du quiz:', { userId, quizId });
    return this.request(`/quizzes/results/user/${userId}/quiz/${quizId}`);
  }

  // === PROGRESS ===
  async getUserProgress(userId: string, courseId: string) {
    console.log('📡 Récupération de la progression:', { userId, courseId });
    return this.request(`/progress/user/${userId}/course/${courseId}`);
  }

  async getCompletedLessons(userId: string, courseId: string) {
    console.log('📡 Récupération des leçons complétées:', { userId, courseId });
    return this.request(`/progress/user/${userId}/course/${courseId}/completed`);
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string) {
    console.log('📡 Marquage leçon complétée:', { userId, courseId, lessonId });
    return this.request('/progress/complete', {
      method: 'POST',
      body: JSON.stringify({ userId, courseId, lessonId }),
    });
  }

  async updateProgress(userId: string, courseId: string, progressData: any) {
    console.log('📡 Mise à jour de la progression:', { userId, courseId });
    return this.request(`/progress/user/${userId}/course/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  // === ADMIN ===
  async getAllUsers() {
    console.log('📡 Récupération de tous les utilisateurs (admin)');
    return this.request('/admin/users');
  }

  async updateUserRole(userId: string, role: string) {
    console.log('📡 Mise à jour du rôle utilisateur:', { userId, role });
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string) {
    console.log('📡 Suppression de l\'utilisateur:', userId);
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getStatistics() {
    console.log('📡 Récupération des statistiques (admin)');
    return this.request('/admin/statistics');
  }
}

export const backendAPI = new BackendAPI(API_URL);