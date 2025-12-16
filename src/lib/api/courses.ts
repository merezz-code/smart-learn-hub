// src/lib/api/courses.ts
import { supabase } from '../supabase';

// Récupérer tous les cours publiés
export async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        *,
        lessons (*)
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Récupérer un cours par ID avec tous ses détails
export async function getCourseById(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules!inner (
        *,
        lessons!inner (
          *,
          quizzes (
            *,
            questions (*)
          )
        )
      )
    `)
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data;
}

// Récupérer les cours par catégorie
export async function getCoursesByCategory(category: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('category', category)
    .eq('is_published', true);

  if (error) throw error;
  return data;
}

// Récupérer les cours par niveau
export async function getCoursesByLevel(level: 'debutant' | 'intermediaire' | 'avance') {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('level', level)
    .eq('is_published', true);

  if (error) throw error;
  return data;
}

// Rechercher des cours
export async function searchCourses(query: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_published', true);

  if (error) throw error;
  return data;
}

// Inscrire un utilisateur à un cours
export async function enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .insert({
      user_id: userId,
      course_id: courseId,
      overall_progress: 0,
      started_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Vérifier si un utilisateur est inscrit à un cours
export async function isEnrolledInCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// Récupérer les cours auxquels un utilisateur est inscrit
export async function getEnrolledCourses(userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      courses (*)
    `)
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false });

  if (error) throw error;
  return data;
}