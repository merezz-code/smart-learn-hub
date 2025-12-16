// src/hooks/useCourses.ts
import { useState, useEffect } from 'react';
import { 
  getCourses, 
  getCourseById, 
  enrollInCourse,
  isEnrolledInCourse,
  getEnrolledCourses 
} from '@/lib/api/courses';
import { toast } from 'sonner';

export function useCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  return { courses, loading, error, refetch: loadCourses };
}

export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) return;
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      const data = await getCourseById(courseId);
      setCourse(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  return { course, loading, error, refetch: loadCourse };
}

export function useEnrollment(userId: string | undefined, courseId: string | undefined) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!userId || !courseId) return;
    checkEnrollment();
  }, [userId, courseId]);

  const checkEnrollment = async () => {
    if (!userId || !courseId) return;

    try {
      setLoading(true);
      const enrolled = await isEnrolledInCourse(userId, courseId);
      setIsEnrolled(enrolled);
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'inscription', err);
    } finally {
      setLoading(false);
    }
  };

  const enroll = async () => {
    if (!userId || !courseId) {
      toast.error('Vous devez être connecté pour vous inscrire');
      return;
    }

    try {
      setEnrolling(true);
      await enrollInCourse(userId, courseId);
      setIsEnrolled(true);
      toast.success('Inscription réussie !');
    } catch (err) {
      console.error('Erreur lors de l\'inscription', err);
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setEnrolling(false);
    }
  };

  return { isEnrolled, loading, enrolling, enroll, refetch: checkEnrollment };
}

export function useEnrolledCourses(userId: string | undefined) {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadEnrolledCourses();
  }, [userId]);

  const loadEnrolledCourses = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await getEnrolledCourses(userId);
      setEnrolledCourses(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Erreur lors du chargement de vos cours');
    } finally {
      setLoading(false);
    }
  };

  return { enrolledCourses, loading, error, refetch: loadEnrolledCourses };
}