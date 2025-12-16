// src/hooks/useCourseProgress.ts
import { useState, useEffect } from 'react';
import { 
  getCourseProgress, 
  getCompletedLessons,
  markLessonComplete,
  getUserStats,
  updateLastAccessed
} from '@/lib/api/progress';
import { toast } from 'sonner';

export function useCourseProgress(userId: string | undefined, courseId: string | undefined) {
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !courseId) return;
    loadProgress();
    updateLastAccessedTime();
  }, [userId, courseId]);

  const loadProgress = async () => {
    if (!userId || !courseId) return;

    try {
      setLoading(true);
      const data = await getCourseProgress(userId, courseId);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateLastAccessedTime = async () => {
    if (!userId || !courseId) return;
    
    try {
      await updateLastAccessed(userId, courseId);
    } catch (err) {
      console.error('Erreur mise à jour dernière visite', err);
    }
  };

  return { progress, loading, error, refetch: loadProgress };
}

export function useCompletedLessons(userId: string | undefined) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    loadCompletedLessons();
  }, [userId]);

  const loadCompletedLessons = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getCompletedLessons(userId);
      setCompletedLessons(data);
    } catch (err) {
      console.error('Erreur chargement leçons complétées', err);
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async (lessonId: string) => {
    if (!userId) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      setCompleting(true);
      await markLessonComplete(userId, lessonId);
      setCompletedLessons(prev => [...prev, lessonId]);
      toast.success('Leçon complétée ! 🎉');
    } catch (err) {
      console.error('Erreur complétion leçon', err);
      toast.error('Erreur lors de la complétion de la leçon');
    } finally {
      setCompleting(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  return { 
    completedLessons, 
    loading, 
    completing,
    completeLesson,
    isLessonCompleted,
    refetch: loadCompletedLessons 
  };
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    quizzesPassed: 0,
    lessonsCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getUserStats(userId);
      setStats(data);
    } catch (err) {
      console.error('Erreur chargement statistiques', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: loadStats };
}