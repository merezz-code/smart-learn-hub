import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export function MathRaceGame() {
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+' });
  const [answer, setAnswer] = useState('');
  const [count, setCount] = useState(0);
  const [score, setScore] = useState(0);

  const generateQuestion = useCallback(() => {
    const a = Math.floor(Math.random() * 20);
    const b = Math.floor(Math.random() * 20);
    setQuestion({ a, b, op: '+' });
    setAnswer('');
  }, []);

  const startGame = () => {
    setScore(0);
    setCount(0);
    setGameStatus('playing');
    generateQuestion();
  };

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = question.a + question.b;
    if (parseInt(answer) === correct) {
      setScore(s => s + 1);
      toast.success("Bravo !");
    } else {
      toast.error(`Raté ! C'était ${correct}`);
    }

    if (count + 1 < 10) {
      setCount(c => c + 1);
      generateQuestion();
    } else {
      setGameStatus('finished');
    }
  };

  if (gameStatus === 'idle') {
    return (
      <div className="card-base p-10 text-center">
        <Zap className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-4">Prêt pour la course ?</h2>
        <p className="mb-6 text-muted-foreground">10 calculs rapides le plus vite possible.</p>
        <Button onClick={startGame} size="lg">Démarrer</Button>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <div className="card-base p-10 text-center animate-fade-in">
        <h2 className="text-3xl font-bold mb-2">Course terminée !</h2>
        <div className="text-5xl font-bold text-primary mb-6">{score}/10</div>
        <Button onClick={startGame} variant="outline" className="gap-2">
          <RotateCcw className="w-4 h-4" /> Rejouer
        </Button>
      </div>
    );
  }

  return (
    <div className="card-base p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <span className="text-sm text-muted-foreground uppercase tracking-wider">Question {count + 1}/10</span>
        <h3 className="text-4xl font-bold mt-2">
          {question.a} + {question.b} = ?
        </h3>
      </div>
      <form onSubmit={check} className="space-y-4">
        <input
          autoFocus
          type="number"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          className="w-full text-center text-2xl p-4 bg-muted rounded-xl border-2 border-transparent focus:border-primary outline-none transition-all"
          placeholder="Ta réponse..."
        />
        <Button type="submit" className="w-full py-6 text-lg">Vérifier</Button>
      </form>
    </div>
  );
}