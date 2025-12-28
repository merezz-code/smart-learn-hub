// src/lib/courseService.ts
// FICHIER PRINCIPAL - Switch entre Mock et Supabase

// Importer les deux implémentations
import { courseService as mockService } from './courseService.mock';
import { courseService as supabaseService } from './courseService.supabase';

// Configuration : choisir quelle version utiliser
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Export conditionnel
export const courseService = USE_SUPABASE ? supabaseService : mockService;

// Export par défaut
export default courseService;

// Re-export des types
export type {
  Course,
  Lesson,
  Quiz,
  QuizResult,
  UserCourseProgress,
  LessonProgress,
  UserStats,
  Certificate,
} from '@/types/course';