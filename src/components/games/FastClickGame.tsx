import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function FastClickGame() {
  const [time, setTime] = useState(10);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (time <= 0) return;
    const interval = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [time]);

  return (
    <div className="card-base p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Temps : {time}s</h2>
      <h3 className="text-xl mb-4">Score : {score}</h3>

      {time > 0 ? (
        <Button
          className="text-lg px-10 py-6"
          onClick={() => setScore(s => s + 1)}
        >
          CLIQUE !
        </Button>
      ) : (
        <p className="font-bold text-xl">Fin ! Score final : {score}</p>
      )}
    </div>
  );
}
