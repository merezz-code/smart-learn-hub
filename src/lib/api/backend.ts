// src/lib/api/backend.ts (Client API)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class BackendAPI {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
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
    return this.request('/courses');
  }

  async getCourseById(id: string) {
    return this.request(`/courses/${id}`);
  }

  async createCourse(courseData: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string) {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // === LESSONS ===
  async getLessonsByCourse(courseId: string) {
    return this.request(`/lessons/course/${courseId}`);
  }

  async getLessonById(id: string) {
    return this.request(`/lessons/${id}`);
  }

  async createLesson(lessonData: any) {
    return this.request('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  // === QUIZZES ===
  async getQuizById(id: string) {
    return this.request(`/quizzes/${id}`);
  }

  async getQuizByLessonId(lessonId: string) {
    return this.request(`/quizzes/lesson/${lessonId}`);
  }

  // === PROGRESS ===
  async getUserProgress(userId: string, courseId: string) {
    return this.request(`/progress/user/${userId}/course/${courseId}`);
  }

  async getCompletedLessons(userId: string, courseId: string) {
    return this.request(`/progress/user/${userId}/course/${courseId}/completed`);
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string) {
    return this.request('/progress/complete', {
      method: 'POST',
      body: JSON.stringify({ userId, courseId, lessonId }),
    });
  }
}

export const backendAPI = new BackendAPI(API_URL);