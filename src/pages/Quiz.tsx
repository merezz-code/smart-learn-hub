import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockQuiz } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

export default function Quiz() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const quiz = mockQuiz;
  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Sélectionnez une réponse');
      return;
    }

    setIsSubmitted(true);
    setAnswers([...answers, selectedAnswer]);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsSubmitted(false);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setIsSubmitted(false);
  };

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom max-w-2xl">
            <div className="card-base p-8 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                passed ? 'bg-success/10' : 'bg-destructive/10'
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
                  : 'Vous pouvez réessayer pour améliorer votre score.'}
              </p>

              <div className="bg-muted/50 rounded-2xl p-6 mb-8">
                <p className="text-5xl font-bold gradient-text mb-2">{percentage}%</p>
                <p className="text-muted-foreground">
                  {score} / {quiz.questions.length} bonnes réponses
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Recommencer
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Retour au dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} / {quiz.questions.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <div className="card-base p-8">
            <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = isSubmitted && isCorrect;
                const showIncorrect = isSubmitted && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      showCorrect
                        ? 'border-success bg-success/10'
                        : showIncorrect
                        ? 'border-destructive bg-destructive/10'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={isSubmitted}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        showCorrect
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
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isSubmitted && question.explanation && (
              <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
                <p className="text-sm font-medium mb-1">Explication :</p>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {!isSubmitted ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                  Valider
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestion < quiz.questions.length - 1 ? (
                    <>
                      Suivant
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    'Voir les résultats'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
