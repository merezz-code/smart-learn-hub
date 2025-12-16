// src/types/course.ts

/**
 * Niveaux de difficulté des cours
 */
export enum CourseLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert"
}

/**
 * Catégories de cours
 */
export enum CourseCategory {
  PROGRAMMING = "programming",
  WEB_DEVELOPMENT = "web_development",
  MOBILE_DEVELOPMENT = "mobile_development",
  DATA_SCIENCE = "data_science",
  DESIGN = "design",
  MARKETING = "marketing",
  BUSINESS = "business",
  LANGUAGES = "languages",
  OTHER = "other"
}

/**
 * Statut de progression de l'utilisateur
 */
export enum ProgressStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

/**
 * Types de questions de quiz
 */
export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
  SHORT_ANSWER = "short_answer",
  CODE = "code"
}

/**
 * Interface pour un cours complet
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number; // en minutes
  instructor?: string;
  instructorAvatar?: string;
  rating?: number;
  reviewsCount?: number;
  studentsCount?: number;
  objectives?: string[];
  prerequisites?: string[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  price?: number; // 0 pour gratuit
  modules: CourseModule[];
}

/**
 * Interface pour un module de cours
 */
export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // en minutes
  lessons: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour une leçon
 */
export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  duration: number; // en minutes
  content: string; // Contenu markdown
  videoUrl?: string;
  videoThumbnail?: string;
  resources?: LessonResource[];
  hasQuiz: boolean;
  quizId?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour les ressources d'une leçon
 */
export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  type: "pdf" | "link" | "code" | "image" | "other";
  url: string;
  size?: number; // en bytes
}

/**
 * Interface pour un quiz
 */
export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string; // null si c'est le quiz final du cours
  title: string;
  description?: string;
  passingScore: number; // Pourcentage minimum pour réussir (ex: 70)
  timeLimit?: number; // en minutes, null = pas de limite
  maxAttempts?: number; // null = illimité
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour une question de quiz
 */
export interface Question {
  id: string;
  quizId: string;
  question: string;
  type: QuestionType;
  order: number;
  points: number;
  options?: QuestionOption[]; // Pour QCM
  correctAnswer: string | string[]; // string pour réponse courte, array pour QCM multiple
  explanation?: string; // Explication de la bonne réponse
  codeSnippet?: string; // Pour questions de code
  media?: {
    type: "image" | "video";
    url: string;
  };
}

/**
 * Interface pour les options d'une question QCM
 */
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

/**
 * Interface pour la progression de l'utilisateur dans un cours
 */
export interface UserCourseProgress {
  id: string;
  userId: string;
  courseId: string;
  status: ProgressStatus;
  completedLessons: string[]; // IDs des leçons complétées
  currentLessonId?: string;
  lastAccessedAt: Date;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // en minutes
  overallProgress: number; // Pourcentage 0-100
  certificateId?: string;
}

/**
 * Interface pour la progression dans une leçon
 */
export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  completed: boolean;
  lastPosition?: number; // Position dans la vidéo (secondes)
  timeSpent: number; // en minutes
  completedAt?: Date;
  notes?: string; // Notes personnelles de l'utilisateur
  bookmarks?: number[]; // Timestamps des favoris
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour les résultats d'un quiz
 */
export interface QuizResult {
  id: string;
  userId: string;
  quizId: string;
  courseId: string;
  score: number; // Pourcentage 0-100
  points: number; // Points obtenus
  totalPoints: number; // Points totaux possibles
  passed: boolean;
  attemptNumber: number;
  answers: UserAnswer[];
  startedAt: Date;
  completedAt: Date;
  timeSpent: number; // en secondes
}

/**
 * Interface pour une réponse d'utilisateur
 */
export interface UserAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent?: number; // en secondes
}

/**
 * Interface pour un certificat
 */
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  score: number;
  issuedAt: Date;
  verificationCode: string;
  pdfUrl?: string;
}

/**
 * Interface pour les badges
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "completion" | "achievement" | "streak" | "special";
  requirement: string; // Description du requis pour obtenir le badge
}

/**
 * Interface pour les badges d'un utilisateur
 */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  badge: Badge;
}

/**
 * Interface pour les filtres de recherche de cours
 */
export interface CourseFilters {
  search?: string;
  category?: CourseCategory;
  level?: CourseLevel;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: "popular" | "recent" | "rating" | "duration" | "title";
  sortOrder?: "asc" | "desc";
}

/**
 * Interface pour les statistiques de l'utilisateur
 */
export interface UserStats {
  userId: string;
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalTimeSpent: number; // en minutes
  averageScore: number;
  badges: UserBadge[];
  currentStreak: number; // jours consécutifs
  longestStreak: number;
  lastActivityDate: Date;
}

/**
 * Interface pour les notifications
 */
export interface Notification {
  id: string;
  userId: string;
  type: "course_completed" | "quiz_passed" | "quiz_failed" | "new_badge" | "reminder" | "new_course";
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

/**
 * Interface pour les évaluations de cours
 */
export interface CourseReview {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment?: string;
  helpful: number; // Nombre de "utile"
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour les notes personnelles
 */
export interface UserNote {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  content: string;
  timestamp?: number; // Si lié à une vidéo
  createdAt: Date;
  updatedAt: Date;
}