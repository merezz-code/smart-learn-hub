export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: string;
  instructorName: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  lessonsCount: number;
  rating: number;
  enrolledCount: number;
  price: number;
  isFree: boolean;
  tags: string[];
  createdAt: Date;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  type: 'video' | 'text' | 'pdf';
  content: string;
  duration: number;
  order: number;
  isCompleted?: boolean;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  answers: number[];
  completedAt: Date;
}

export interface GameScore {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  timeSpent: number;
  actions: number;
  level?: number;
  completedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
}

export interface ChatSource {
  documentName: string;
  page?: number;
  relevance: number;
}

export interface UserProgress {
  coursesEnrolled: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  quizzesPassed: number;
  averageScore: number;
  totalTimeSpent: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface EnrolledCourse extends Course {
  progress: number;
  lastAccessedAt: Date;
  completedLessons: string[];
}
