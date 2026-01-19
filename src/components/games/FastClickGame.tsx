import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, MousePointer2, Timer } from 'lucide-react';

export function FastClickGame() {
  const [time, setTime] = useState(10);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else if (time === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const resetGame = () => {
    setTime(10);
    setScore(0);
    setIsActive(true);
  };

  return (
    <div className="card-base p-10 text-center max-w-sm mx-auto">
      {!isActive && time === 10 ? (
        <>
          <MousePointer2 className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-6">Test de réflexe</h2>
          <Button onClick={() => setIsActive(true)} size="lg" className="w-full">Commencer</Button>
        </>
      ) : time > 0 ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2"><Timer className="w-4 h-4" /> {time}s</div>
            <div className="font-bold">Score: {score}</div>
          </div>
          <button
            onClick={() => setScore(s => s + 1)}
            className="w-40 h-40 rounded-full bg-primary text-primary-foreground text-3xl font-bold shadow-lg hover:scale-95 active:scale-90 transition-transform flex items-center justify-center mx-auto border-8 border-primary/20"
          >
            CLIC !
          </button>
        </div>
      ) : (
        <div className="animate-bounce-in">
          <h2 className="text-2xl font-bold mb-2">Temps écoulé !</h2>
          <p className="text-4xl font-black text-primary mb-6">{score} clics</p>
          <Button onClick={resetGame} variant="default" className="gap-2">
            <RotateCcw className="w-4 h-4" /> Réessayer
          </Button>
        </div>
      )}
    </div>
  );
}