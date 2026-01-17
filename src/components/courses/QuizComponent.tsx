// src/components/courses/QuizComponent.tsx - VERSION CORRIGÉE
import { useState } from 'react';
import { Quiz, Question, QuestionType, UserAnswer } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizComponentProps {
  quiz: Quiz;
  onComplete: (score: number, answers: UserAnswer[]) => void;
  onCancel?: () => void;
}

export function QuizComponent({ quiz, onComplete, onCancel }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleSelectAnswer = (answer: string) => {
    if (isSubmitted) return;

    if (question.type === QuestionType.MULTIPLE_CHOICE &&
      Array.isArray(question.correctAnswer)) {
      // Questions à choix multiples
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : [];
      if (current.includes(answer)) {
        setSelectedAnswer(current.filter(a => a !== answer));
      } else {
        setSelectedAnswer([...current, answer]);
      }
    } else {
      // Question à choix unique
      setSelectedAnswer(answer);
    }
  };

  const checkAnswer = (userAns: string | string[], question: Question): boolean => {
  // Trouver l'option qui correspond au texte sélectionné
  const selectedOption = question.options?.find(opt => opt.text === userAns);
  
  // Si l'option existe et qu'elle a une propriété isCorrect, on l'utilise
  if (selectedOption && selectedOption.isCorrect !== undefined) {
    return selectedOption.isCorrect;
  }

  // Sinon, fallback sur la comparaison classique
  return userAns === question.correctAnswer;
};

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
      toast.error('Veuillez sélectionner une réponse');
      return;
    }

    const isCorrect = checkAnswer(selectedAnswer, question);
    const pointsEarned = isCorrect ? question.points : 0;

    const answer: UserAnswer = {
      questionId: question.id,
      userAnswer: selectedAnswer,
      isCorrect,
      pointsEarned,
    };

    console.log('📝 Réponse enregistrée:', answer);
    setUserAnswers([...userAnswers, answer]);
    setIsSubmitted(true);
  };


  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      // Passage à la question suivante
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      // --- LOGIQUE DE FIN DE QUIZ ---

      // 1. On utilise les réponses déjà validées dans userAnswers
      // (Puisque l'utilisateur doit cliquer sur "Valider" avant de voir le bouton "Terminer")
      const finalAnswersList = userAnswers;

      // 2. Calcul des points basé sur les réponses validées
      const totalPoints = finalAnswersList.reduce((sum, a) => sum + a.pointsEarned, 0);
      const maxPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

      // 3. Calcul du pourcentage
      const finalScorePercent = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

      console.log('🏁 Fin du quiz - Calcul final:', {
        points: totalPoints,
        total: maxPoints,
        pourcentage: finalScorePercent,
        reponses: finalAnswersList
      });

      // 4. Envoi au parent (QuizPage)
      onComplete(finalScorePercent, finalAnswersList);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setIsSubmitted(true);
      const prevAnswer = userAnswers[currentQuestion - 1];
      if (prevAnswer) {
        setSelectedAnswer(prevAnswer.userAnswer);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}
        </div>
        {timeLeft !== null && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-warning" />
            <span className="font-medium">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} / {quiz.questions.length}
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <div className="card-base p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-lg font-semibold flex-1">{question.question}</h3>
          <div className="flex items-center gap-2 ml-4">
            <Award className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">{question.points} pts</span>
          </div>
        </div>

        {/* Image/Media si présent */}
        {question.media && (
          <div className="mb-6">
            <img
              src={question.media.url}
              alt="Question media"
              className="w-full rounded-lg max-h-64 object-cover"
            />
          </div>
        )}

        {/* Code Snippet si présent */}
        {question.codeSnippet && (
          <pre className="bg-muted p-4 rounded-lg mb-6 overflow-x-auto">
            <code className="text-sm">{question.codeSnippet}</code>
          </pre>
        )}

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options?.map((option, index) => {
            const optionValue = option.text;
            const isSelected = Array.isArray(selectedAnswer)
              ? selectedAnswer.includes(optionValue)
              : selectedAnswer === optionValue;
            const isCorrect = option.isCorrect;
            const showCorrect = isSubmitted && isCorrect;
            const showIncorrect = isSubmitted && isSelected && !isCorrect;

            return (
              <button
                key={option.id}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${showCorrect
                    ? 'border-success bg-success/10'
                    : showIncorrect
                      ? 'border-destructive bg-destructive/10'
                      : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                onClick={() => handleSelectAnswer(optionValue)}
                disabled={isSubmitted}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${showCorrect
                      ? 'border-success bg-success text-success-foreground'
                      : showIncorrect
                        ? 'border-destructive bg-destructive text-destructive-foreground'
                        : isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                    }`}>
                    {showCorrect ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : showIncorrect ? (
                      <XCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    )}
                  </div>
                  <span className="font-medium flex-1">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {isSubmitted && question.explanation && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6">
            <p className="text-sm font-medium mb-1 text-blue-600 dark:text-blue-400">
              💡 Explication
            </p>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex items-center gap-3">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Annuler
              </Button>
            )}

            {!isSubmitted ? (
              <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
                Valider
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                {currentQuestion < quiz.questions.length - 1 ? (
                  <>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  'Terminer le quiz'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Info Footer */}
      <div className="text-xs text-muted-foreground text-center">
        Score minimum requis: {quiz.passingScore}%
        {quiz.maxAttempts && ` • Tentatives limitées: ${quiz.maxAttempts}`}
      </div>
    </div>
  );
}