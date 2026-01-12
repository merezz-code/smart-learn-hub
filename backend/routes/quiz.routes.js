// backend/routes/quiz.routes.js
import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/quizzes/:id
 * Récupérer un quiz avec ses questions
 */

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Récupération quiz:', req.params.id);
    
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }
    
    const questions = await Question.findByQuizId(req.params.id);
    console.log(`📝 ${questions.length} questions trouvées`); // ← AJOUTER

    // Parser les options JSON et formater pour le frontend
    const formattedQuestions = questions.map((q, index) => {
      // Parser les options si c'est une string
      let options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      
      console.log('Question brute:', { 
        id: q.id, 
        text: q.question_text?.substring(0, 50),
        optionsType: typeof options,
        optionsIsArray: Array.isArray(options),
        options 
      });


      
      // Convertir en format attendu par le frontend
      // Si c'est un array de strings, le convertir en array d'objets
      if (Array.isArray(options) && options.length > 0) {
        if (typeof options[0] === 'string') {
          options = options.map((text, i) => ({
            id: String.fromCharCode(97 + i),
            text: text,
            isCorrect: String.fromCharCode(97 + i) === q.correct_answer
          }));
        } else if (options[0].text) {
          // Déjà au bon format, juste ajouter isCorrect
          options = options.map(opt => ({
            ...opt,
            isCorrect: opt.id === q.correct_answer
          }));
        }
      }
      
      const formatted = {
        id: q.id.toString(),
        question: q.question_text,
        type: q.question_type || 'multiple_choice',
        options: options,
        correctAnswer: q.correct_answer,
        points: q.points || 1,
        explanation: q.explanation || '',
        order: q.order_index || index,
        media: null,
        codeSnippet: null
      };
           
      return formatted;
    });
    
    const formattedQuiz = {
      id: quiz.id.toString(),
      courseId: quiz.course_id.toString(),
      lessonId: quiz.lesson_id ? quiz.lesson_id.toString() : null,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passing_score,
      timeLimit: quiz.time_limit || 0,
      maxAttempts: quiz.max_attempts || 0,
      questions: formattedQuestions,
      createdAt: quiz.created_at,
      updatedAt: quiz.updated_at
    };
    
    console.log('✅ Quiz formaté avec', formattedQuestions.length, 'questions');


    console.log('✅ Quiz formaté:', {
      id: formattedQuiz.id,
      title: formattedQuiz.title,
      questionsCount: formattedQuiz.questions.length
    });

    res.json(formattedQuiz);
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    res.status(500).json({ error: error.message });
  }
});


// 🔐 Route protégée: Sauvegarder les résultats d'un quiz
router.post('/results', authenticateToken, async (req, res) => {
  try {
    const {
      quizId,
      score,
      points,
      totalPoints,
      passed,
      attemptNumber,
      answers,
      timeSpent
    } = req.body;
   
    // TODO: Implémenter la sauvegarde dans une table quiz_results
    // Pour l'instant, retourner un succès
    
    res.json({
      success: true,
      message: 'Résultats sauvegardés',
      result: {
        id: Date.now().toString(),
        userId: req.user.id,
        quizId,
        score,
        passed,
        completedAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde résultats:', error);
    res.status(500).json({ error: error.message });
  }
});


// 🔐 Route protégée: Récupérer les résultats d'un utilisateur pour un quiz
router.get('/results/user/:userId/quiz/:quizId', authenticateToken, async (req, res) => {
  try {
    const { userId, quizId } = req.params;
    
    // Vérifier que l'utilisateur demande ses propres résultats
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    console.log('📊 Récupération résultats:', { userId, quizId });
        
    res.json([]);
  } catch (error) {
    console.error('❌ Erreur récupération résultats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/quizzes/lesson/:lessonId
 * Récupérer le quiz d'une leçon
 */
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findByLessonId(req.params.lessonId);
    
    if (!quiz) {
      return res.status(404).json({ error: 'Pas de quiz pour cette leçon' });
    }
    
    const questions = await Question.findByQuizId(quiz.id);
    res.json({ ...quiz, questions });
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/quizzes/course/:courseId
 * Récupérer tous les quiz d'un cours
 */
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.findByCourseId(req.params.courseId);
    
    // Ajouter le nombre de questions pour chaque quiz
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions_count = await Question.countByQuiz(quiz.id);
        return { ...quiz, questions_count };
      })
    );
    
    res.json(quizzesWithCount);
  } catch (error) {
    console.error('❌ Erreur récupération quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/quizzes/:id/submit
 * Soumettre les réponses d'un quiz
 */
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body; // { questionId: answer }
    
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Réponses invalides' });
    }

    // Récupérer le quiz et ses questions
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz non trouvé' });
    }

    const questions = await Question.findByQuizId(req.params.id);

    // Calculer le score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const results = questions.map(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      let isCorrect = false;
      
      // Vérifier la réponse selon le type
      if (question.question_type === 'multiple_choice') {
        isCorrect = userAnswer === question.correct_answer;
      } else if (question.question_type === 'true_false') {
        isCorrect = userAnswer === question.correct_answer;
      } else if (question.question_type === 'short_answer') {
        isCorrect = userAnswer?.toLowerCase().trim() === 
                   question.correct_answer.toLowerCase().trim();
      }

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points;
      }

      return {
        question_id: question.id,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
        is_correct: isCorrect,
        points: isCorrect ? question.points : 0,
        explanation: question.explanation
      };
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passing_score;

    res.json({
      score,
      passed,
      correct_answers: correctAnswers,
      total_questions: questions.length,
      earned_points: earnedPoints,
      total_points: totalPoints,
      passing_score: quiz.passing_score,
      results
    });
  } catch (error) {
    console.error('❌ Erreur soumission quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;