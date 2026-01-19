import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Trophy, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Star, 
  HelpCircle, 
  Send 
} from 'lucide-react';

interface Question {
  q: string;
  a: string;
  points: number;
  feedback: string;
}

const quizQuestions: Question[] = [
  { q: 'Que signifie CPU ?', a: 'Processeur central', points: 10, feedback: 'Le Central Processing Unit est le cerveau de l\'ordinateur.' },
  { q: 'HTTP est un protocole de type ?', a: 'Application', points: 10, feedback: 'Il appartient à la couche 7 du modèle OSI.' },
  { q: 'Quel port est utilisé par défaut pour HTTPS ?', a: '443', points: 15, feedback: 'Le port 443 assure une communication sécurisée via TLS/SSL.' },
  { q: 'Que signifie SQL ?', a: 'Structured Query Language', points: 10, feedback: 'C\'est le langage standard pour les bases de données relationnelles.' },
  { q: 'Quel langage est principalement utilisé pour le style web ?', a: 'CSS', points: 5, feedback: 'Cascading Style Sheets permet de mettre en forme le HTML.' },
  { q: 'Qui a créé le langage JavaScript ?', a: 'Brendan Eich', points: 20, feedback: 'Il l\'a créé en seulement 10 jours en 1995 pour Netscape.' },
  { q: 'Quel protocole est utilisé pour envoyer des emails ?', a: 'SMTP', points: 15, feedback: 'Simple Mail Transfer Protocol est dédié à l\'envoi.' },
  { q: 'En Git, quelle commande fusionne des branches ?', a: 'git merge', points: 10, feedback: 'Merge combine les historiques de deux branches.' },
  { q: 'Quelle est l\'extension des fichiers React avec du balisage ?', a: 'jsx', points: 10, feedback: 'Le JSX permet d\'écrire du HTML directement dans le JavaScript.' },
  { q: 'Quel est le format de données le plus utilisé sur le web ?', a: 'JSON', points: 10, feedback: 'JavaScript Object Notation est léger et facile à lire.' }
];

export function QuizGame() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; points: number; isCorrect: boolean } | null>(null);

  const current = quizQuestions[step];

  const submit = () => {
    if (feedback || !answer.trim()) return;

    const isCorrect = answer.trim().toLowerCase() === current.a.toLowerCase();
    const pointsGained = isCorrect ? current.points : 0;

    if (isCorrect) {
      setScore(s => s + pointsGained);
      toast.success("Bonne réponse !");
    } else {
      toast.error("Ce n'est pas tout à fait ça...");
    }

    setFeedback({
      text: isCorrect ? current.feedback : `La réponse attendue était : ${current.a}`,
      points: pointsGained,
      isCorrect
    });

    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      if (step + 1 < quizQuestions.length) {
        setStep(s => s + 1);
      } else {
        setIsComplete(true);
      }
    }, 2500);
  };

  const resetGame = useCallback(() => {
    setStep(0);
    setAnswer('');
    setScore(0);
    setIsComplete(false);
    setFeedback(null);
  }, []);

  const getFinalRating = () => {
    const maxScore = quizQuestions.reduce((acc, q) => acc + q.points, 0);
    const ratio = score / maxScore;
    if (ratio >= 0.8) return { stars: 3, text: 'Expert IT !' };
    if (ratio >= 0.5) return { stars: 2, text: 'Bonnes connaissances' };
    return { stars: 1, text: 'Apprenti Tech' };
  };

  if (isComplete) {
    const rating = getFinalRating();
    return (
      <div className="card-base p-10 text-center animate-in zoom-in duration-300 max-w-xl mx-auto">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2">Quiz Terminé !</h2>
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(3)].map((_, i) => (
            <Star key={i} className={`w-8 h-8 ${i < rating.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
          ))}
        </div>
        <p className="text-muted-foreground mb-1">{rating.text}</p>
        <p className="text-4xl font-black gradient-text mb-8">{score} points</p>
        <Button onClick={resetGame} size="lg" className="gap-2 w-full">
          <RotateCcw className="w-4 h-4" /> Recommencer le Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Stats Header */}
      <div className="card-base p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>{score} <span className="text-xs text-muted-foreground uppercase tracking-tighter">pts</span></span>
        </div>
        <div className="text-sm font-medium bg-secondary px-4 py-1 rounded-full border">
          Question {step + 1} / {quizQuestions.length}
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
          feedback.isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {feedback.isCorrect ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          <div>
            <p className={`font-bold text-sm ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {feedback.isCorrect ? `+${feedback.points} points` : '0 point'}
            </p>
            <p className="text-sm text-muted-foreground leading-snug">{feedback.text}</p>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="card-base p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <HelpCircle className="w-20 h-20" />
        </div>
        
        <h3 className="text-2xl font-bold mb-8 leading-tight">{current.q}</h3>
        
        <div className="space-y-4">
          <Input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            className="text-center text-lg h-14 bg-muted/50 border-2 focus-visible:ring-primary"
            placeholder="Tapez votre réponse ici..."
            disabled={feedback !== null}
            autoFocus
          />

          <Button 
            onClick={submit} 
            disabled={feedback !== null || !answer.trim()}
            className="w-full h-12 text-lg gap-2"
          >
            <Send className="w-4 h-4" />
            Valider la réponse
          </Button>
        </div>
      </div>

      {/* Recommencer button */}
      <div className="text-center pt-2">
        <Button variant="ghost" onClick={resetGame} className="text-muted-foreground hover:text-primary gap-2">
          <RotateCcw className="w-4 h-4" /> Recommencer à zéro
        </Button>
      </div>
    </div>
  );
}