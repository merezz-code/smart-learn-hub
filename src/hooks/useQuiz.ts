// src/hooks/useQuiz.ts
import { useState, useEffect } from 'react';
import { 
  getQuizById,
  getQuizByLessonId,
  submitQuizAttempt,
  getQuizAttempts,
  getBestQuizAttempt,
  calculateQuizScore
} from '@/lib/api/quizzes';
import { toast } from 'sonner';

export function useQuiz(quizId: string | undefined) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!quizId) return;
    loadQuiz();
  }, [quizId]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      const data = await getQuizById(quizId);
      setQuiz(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error('Erreur lors du chargement du quiz');
    } finally {
      setLoading(false);
    }
  };

  return { quiz, loading, error, refetch: loadQuiz };
}

export function useQuizByLesson(lessonId: string | undefined) {
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    if (!lessonId) return;

    try {
      setLoading(true);
      const data = await getQuizByLessonId(lessonId);
      setQuiz(data);
      setHasQuiz(!!data);
    } catch (err) {
      console.error('Erreur chargement quiz', err);
    } finally {
      setLoading(false);
    }
  };

  return { quiz, loading, hasQuiz, refetch: loadQuiz };
}

export function useQuizAttempt(userId: string | undefined, quizId: string | undefined) {
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [bestAttempt, setBestAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !quizId) return;
    loadAttempts();
    loadBestAttempt();
  }, [userId, quizId]);

  const loadAttempts = async () => {
    if (!userId || !quizId) return;

    try {
      const data = await getQuizAttempts(userId, quizId);
      setAttempts(data);
    } catch (err) {
      console.error('Erreur chargement tentatives', err);
    }
  };

  const loadBestAttempt = async () => {
    if (!userId || !quizId) return;

    try {
      setLoading(true);
      const data = await getBestQuizAttempt(userId, quizId);
      setBestAttempt(data);
    } catch (err) {
      console.error('Erreur chargement meilleure tentative', err);
    } finally {
      setLoading(false);
    }
  };

  const submitAttempt = async (
    lessonId: string,
    questions: any[],
    userAnswers: any[],
    timeSpent: number
  ) => {
    if (!userId || !quizId) {
      toast.error('Vous devez être connecté');
      return null;
    }

    try {
      setSubmitting(true);

      // Calculer le score
      const { score, passed, results } = calculateQuizScore(questions, userAnswers);

      // Soumettre la tentative
      const attempt = await submitQuizAttempt(
        userId,
        quizId,
        lessonId,
        results,
        score,
        passed,
        timeSpent
      );

      // Rafraîchir les tentatives
      await loadAttempts();
      await loadBestAttempt();

      if (passed) {
        toast.success(`Félicitations ! Score : ${score}%`);
      } else {
        toast.error(`Score : ${score}%. Réessayez !`);
      }

      return { score, passed, results };
    } catch (err) {
      console.error('Erreur soumission quiz', err);
      toast.error('Erreur lors de la soumission du quiz');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    attempts,
    bestAttempt,
    loading,
    submitting,
    submitAttempt,
    refetch: () => {
      loadAttempts();
      loadBestAttempt();
    }
  };
}