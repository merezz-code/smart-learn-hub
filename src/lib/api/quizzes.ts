// src/lib/api/quizzes.ts
import { supabase } from '../supabase';

// Récupérer un quiz par ID avec toutes ses questions
export async function getQuizById(quizId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions (*)
    `)
    .eq('id', quizId)
    .single();

  if (error) throw error;
  return data;
}

// Récupérer le quiz d'une leçon
export async function getQuizByLessonId(lessonId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      *,
      questions (*)
    `)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Soumettre une tentative de quiz
export async function submitQuizAttempt(
  userId: string,
  quizId: string,
  lessonId: string,
  answers: any[],
  score: number,
  passed: boolean,
  timeSpent: number
) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({
      user_id: userId,
      quiz_id: quizId,
      lesson_id: lessonId,
      score,
      answers,
      passed,
      time_spent: timeSpent,
      attempted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Récupérer toutes les tentatives d'un utilisateur pour un quiz
export async function getQuizAttempts(userId: string, quizId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('attempted_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Récupérer la meilleure tentative d'un utilisateur pour un quiz
export async function getBestQuizAttempt(userId: string, quizId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('score', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Calculer le score d'un quiz
export function calculateQuizScore(
  questions: any[],
  userAnswers: any[]
): { score: number; passed: boolean; results: any[] } {
  let correctCount = 0;
  const results = questions.map((question, index) => {
    const userAnswer = userAnswers[index];
    const correctAnswer = question.correct_answer;
    
    let isCorrect = false;
    
    // Pour les QCM avec réponses multiples
    if (Array.isArray(correctAnswer)) {
      isCorrect = JSON.stringify(userAnswer?.sort()) === JSON.stringify(correctAnswer.sort());
    } else {
      isCorrect = userAnswer === correctAnswer;
    }
    
    if (isCorrect) correctCount++;
    
    return {
      questionId: question.id,
      userAnswer,
      correctAnswer,
      isCorrect,
      points: isCorrect ? question.points : 0
    };
  });
  
  const score = Math.round((correctCount / questions.length) * 100);
  const passingScore = 60; // Peut être récupéré depuis les paramètres du quiz
  
  return {
    score,
    passed: score >= passingScore,
    results
  };
}

// Récupérer les statistiques de quiz d'un utilisateur
export async function getUserQuizStats(userId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('score, passed')
    .eq('user_id', userId);

  if (error) throw error;

  const total = data.length;
  const passed = data.filter(attempt => attempt.passed).length;
  const averageScore = total > 0 
    ? Math.round(data.reduce((sum, attempt) => sum + attempt.score, 0) / total)
    : 0;

  return {
    totalAttempts: total,
    passedCount: passed,
    averageScore
  };
}