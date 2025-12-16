// src/lib/api/progress.ts
import { supabase } from '../supabase';

// Récupérer la progression d'un utilisateur pour un cours
export async function getCourseProgress(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      courses (
        *,
        modules (
          *,
          lessons (*)
        )
      )
    `)
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (error) throw error;
  return data;
}

// Récupérer les leçons complétées par un utilisateur
export async function getCompletedLessons(userId: string) {
  const { data, error } = await supabase
    .from('completed_lessons')
    .select('lesson_id')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(item => item.lesson_id);
}

// Marquer une leçon comme complétée
export async function markLessonComplete(userId: string, lessonId: string) {
  const { data, error } = await supabase
    .from('completed_lessons')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,lesson_id'
    })
    .select()
    .single();

  if (error) throw error;
  
  // Mettre à jour la progression globale du cours
  await updateCourseProgress(userId, lessonId);
  
  return data;
}

// Mettre à jour la progression globale d'un cours
async function updateCourseProgress(userId: string, lessonId: string) {
  // Récupérer le module_id de la leçon
  const { data: lesson } = await supabase
    .from('lessons')
    .select('module_id')
    .eq('id', lessonId)
    .single();

  if (!lesson) return;

  // Récupérer le course_id depuis le module
  const { data: module } = await supabase
    .from('modules')
    .select('course_id')
    .eq('id', lesson.module_id)
    .single();

  if (!module) return;

  const courseId = module.course_id;

  // Récupérer tous les modules du cours
  const { data: courseModules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (!courseModules) return;

  const moduleIds = courseModules.map(m => m.id);

  // Compter le nombre total de leçons du cours
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', moduleIds);

  if (!allLessons) return;

  // Compter les leçons complétées par l'utilisateur
  const lessonIds = allLessons.map(l => l.id);
  const { data: completedLessons } = await supabase
    .from('completed_lessons')
    .select('lesson_id')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  const totalLessons = allLessons.length;
  const completed = completedLessons?.length || 0;
  const progress = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;

  // Mettre à jour la progression
  await supabase
    .from('user_progress')
    .update({
      overall_progress: progress,
      last_accessed_at: new Date().toISOString(),
      completed_at: progress === 100 ? new Date().toISOString() : null
    })
    .eq('user_id', userId)
    .eq('course_id', courseId);
}

// Récupérer les statistiques d'un utilisateur
export async function getUserStats(userId: string) {
  // Cours inscrits
  const { count: enrolledCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Cours complétés
  const { count: completedCount } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('overall_progress', 100);

  // Quiz réussis
  const { count: quizzesPassed } = await supabase
    .from('quiz_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('passed', true);

  // Leçons complétées
  const { count: lessonsCompleted } = await supabase
    .from('completed_lessons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    coursesEnrolled: enrolledCount || 0,
    coursesCompleted: completedCount || 0,
    quizzesPassed: quizzesPassed || 0,
    lessonsCompleted: lessonsCompleted || 0
  };
}

// Mettre à jour la dernière date d'accès
export async function updateLastAccessed(userId: string, courseId: string) {
  const { error } = await supabase
    .from('user_progress')
    .update({
      last_accessed_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (error) throw error;
}