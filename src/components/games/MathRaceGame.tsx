import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function MathRaceGame() {
  const [a] = useState(() => Math.floor(Math.random() * 10));
  const [b] = useState(() => Math.floor(Math.random() * 10));
  const [answer, setAnswer] = useState('');
  const [done, setDone] = useState(false);

  const correct = a + b;

  const check = () => {
    setDone(true);
  };

  return (
    <div className="card-base p-6 text-center max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">
        {a} + {b} = ?
      </h3>

      {!done ? (
        <>
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="input mb-4 w-full"
          />

          <Button onClick={check} className="w-full">
            Vérifier
          </Button>
        </>
      ) : (
        <p className="text-2xl font-bold">
          {Number(answer) === correct ? '✔ Correct !' : '❌ Incorrect'}
        </p>
      )}
    </div>
  );
}
