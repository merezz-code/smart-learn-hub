import { useState } from 'react';
import { Button } from '@/components/ui/button';

const questions = [
  { q: 'Que signifie CPU ?', a: 'Processeur central' },
  { q: 'HTTP est un protocole de type ?', a: 'Application' },
  { q: 'Port utilisé par HTTPS ?', a: '443' },
  { q: 'SQL signifie ?', a: 'Structured Query Language' },
];

export function QuizGame() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);

  const current = questions[step];

  const submit = () => {
    if (answer.trim().toLowerCase() === current.a.toLowerCase()) {
      setScore(s => s + 1);
    }
    setAnswer('');
    setStep(s => s + 1);
  };

  if (step >= questions.length) {
    return (
      <div className="card-base p-6 text-center">
        <h2 className="text-2xl font-bold">Score : {score}/{questions.length}</h2>
      </div>
    );
  }

  return (
    <div className="card-base p-6 max-w-xl mx-auto">
      <h3 className="text-xl font-bold mb-4">{current.q}</h3>
      <input
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        className="input mb-4 w-full"
        placeholder="Votre réponse..."
      />

      <Button onClick={submit} className="w-full">
        Valider
      </Button>
    </div>
  );
}
