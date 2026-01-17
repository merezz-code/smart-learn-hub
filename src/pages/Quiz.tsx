// src/pages/Quiz.tsx - VERSION CORRIGÉE
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { QuizComponent } from '@/components/courses/QuizComponent';
import { useAuth } from '@/contexts/AuthContext';
import { RotateCcw, Trophy, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Quiz, UserAnswer } from '@/types/course';
import { courseService } from '@/lib/courseService';

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [attemptNumber, setAttemptNumber] = useState(1);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId, user]);

  const loadQuiz = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      console.log('🔍 Chargement du quiz ID:', quizId);

      const quizData = await courseService.getQuizById(quizId);

      if (!quizData) {
        throw new Error('Quiz non trouvé');
      }

      console.log('✅ Quiz chargé:', quizData);
      console.log('📝 Nombre de questions:', quizData.questions?.length || 0);

      // ✅ VÉRIFICATION CRITIQUE
      if (!quizData.questions || quizData.questions.length === 0) {
        toast.error('Ce quiz ne contient aucune question');
        navigate(-1);
        return;
      }

      setQuiz(quizData);

      // Charger les tentatives précédentes
      if (user) {
        try {
          const results = await courseService.getUserQuizResults(user.id.toString(), quizId);
          setAttemptNumber((results?.length || 0) + 1);
        } catch (error) {
          console.warn('⚠️ Impossible de charger les résultats précédents:', error);
          setAttemptNumber(1);
        }
      }
    } catch (error) {
      console.error('❌ Erreur chargement quiz:', error);
      toast.error('Impossible de charger le quiz');
      setTimeout(() => navigate(-1), 2000);
    } finally {
      setLoading(false);
    }
  };
  const handleQuizFinish = async (finalScore: number, answers: UserAnswer[]) => {
  if (!quiz || !user) return;

  try {
    // 1. Préparation des données (payload)
    const totalPoints = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

    const resultPayload = {
      userId: user.id,
      quizId: quizId,
      courseId: quiz.courseId,
      score: finalScore,
      points: totalPoints,
      totalPoints: maxPoints,
      passed: finalScore >= quiz.passingScore,
      answers: answers,
      completedAt: new Date().toISOString()
    };

    // 2. Sauvegarde en base de données (votre service)
    await courseService.saveQuizResult(resultPayload);
    toast.success("Résultats enregistrés !");

    // 3. Mise à jour de l'état UI pour afficher la page de résultats
    setScore(finalScore);
    setUserAnswers(answers);
    setShowResult(true); // <--- C'est cette ligne qui déclenche le passage à la page de résultat

  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde:", error);
    toast.error("Erreur lors de la sauvegarde du score.");
    
    // Optionnel : afficher quand même les résultats même si la sauvegarde a échoué
    setScore(finalScore);
    setUserAnswers(answers);
    setShowResult(true);
  }
};


  const handleRestart = () => {
    setShowResult(false);
    setScore(0);
    setUserAnswers([]);
    setAttemptNumber(attemptNumber + 1);
  };

  const handleBackToCourse = () => {
    if (quiz?.courseId) {
      navigate(`/course/${quiz.courseId}`);
    } else {
      navigate('/courses');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement du quiz...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="section-padding text-center">
          <h1 className="text-2xl font-bold mb-4">Quiz non trouvé</h1>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </Layout>
    );
  }

  // Page des résultats
  if (showResult) {
    const passed = score >= quiz.passingScore;
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;

    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom max-w-2xl">
            <button
              onClick={handleBackToCourse}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au cours
            </button>

            <div className="card-base p-8 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${passed ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                {passed ? (
                  <Trophy className="w-10 h-10 text-success" />
                ) : (
                  <XCircle className="w-10 h-10 text-destructive" />
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">
                {passed ? 'Félicitations ! 🎉' : 'Continuez à apprendre !'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {passed
                  ? 'Vous avez réussi le quiz avec brio !'
                  : `Vous devez obtenir au moins ${quiz.passingScore}% pour réussir.`}
              </p>

              <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                <p className="text-5xl font-bold gradient-text mb-2">{Math.round(score)}%</p>
                <p className="text-muted-foreground">
                  {correctAnswers} / {quiz.questions.length} bonnes réponses
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Score obtenu</p>
                  <p className="text-2xl font-bold">{Math.round(score)}%</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Score minimum</p>
                  <p className="text-2xl font-bold">{quiz.passingScore}%</p>
                </div>
              </div>

              {quiz.maxAttempts && (
                <p className="text-sm text-muted-foreground mb-6">
                  Tentative {attemptNumber}
                  {quiz.maxAttempts && ` sur ${quiz.maxAttempts}`}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {(!quiz.maxAttempts || attemptNumber < quiz.maxAttempts) && (
                  <Button variant="outline" onClick={handleRestart}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Recommencer
                  </Button>
                )}
                <Button onClick={handleBackToCourse}>
                  Retour au cours
                </Button>
              </div>

              {!passed && (
                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground">
                    💡 Conseil: Relisez la leçon et réessayez le quiz pour améliorer votre score.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Page du quiz
  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom max-w-3xl">
          <button
            onClick={handleBackToCourse}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au cours
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              {attemptNumber > 1 && (
                <span className="text-sm text-muted-foreground">
                  (Tentative {attemptNumber})
                </span>
              )}
            </div>
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
          </div>

          <div className="card-base p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium">{quiz.questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Score minimum:</span>
                <span className="font-medium">{quiz.passingScore}%</span>
              </div>
              {quiz.timeLimit && quiz.timeLimit > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Temps limite:</span>
                  <span className="font-medium">{quiz.timeLimit} min</span>
                </div>
              )}
              {quiz.maxAttempts && quiz.maxAttempts > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tentatives max:</span>
                  <span className="font-medium">{quiz.maxAttempts}</span>
                </div>
              )}
            </div>
          </div>

          <QuizComponent
            quiz={quiz}
            onComplete={handleQuizFinish}
            onCancel={handleBackToCourse}
          />
        </div>
      </div>
    </Layout>
  );
}