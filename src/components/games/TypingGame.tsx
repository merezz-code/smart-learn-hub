import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Clock, RotateCcw, Zap, Keyboard } from 'lucide-react';

const codeSnippets = [
  'const sum = (a, b) => a + b;',
  'function hello() { return "world"; }',
  'let data = await fetch(url);',
  'const arr = [1, 2, 3].map(x => x * 2);',
  'if (user.isAdmin) { grant(); }',
  'export default function App() {}',
  'const [state, setState] = useState();',
  'for (let i = 0; i < 10; i++) {}',
  'const obj = { name: "John", age: 30 };',
  'try { await save(); } catch (e) {}'
];

export function TypingGame() {
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const getRandomSnippet = useCallback(() => {
    return codeSnippets[Math.floor(Math.random() * codeSnippets.length)];
  }, []);

  const initializeGame = useCallback(() => {
    setCurrentText(getRandomSnippet());
    setUserInput('');
    setCurrentIndex(0);
    setScore(0);
    setTime(30);
    setWpm(0);
    setAccuracy(100);
    setTotalChars(0);
    setCorrectChars(0);
    setGameComplete(false);
    setGameStarted(true);
    
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [getRandomSnippet]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameComplete && time > 0) {
      interval = setInterval(() => {
        setTime(t => {
          if (t <= 1) {
            setGameComplete(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, time]);

  useEffect(() => {
    if (totalChars > 0) {
      const elapsed = 30 - time;
      if (elapsed > 0) {
        setWpm(Math.round((correctChars / 5) / (elapsed / 60)));
      }
      setAccuracy(Math.round((correctChars / totalChars) * 100));
    }
  }, [correctChars, totalChars, time]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameComplete) return;
    
    const value = e.target.value;
    setUserInput(value);
    setTotalChars(t => t + 1);

    if (value === currentText) {
      // Completed current snippet
      const points = Math.round(currentText.length * (accuracy / 100));
      setScore(s => s + points);
      setCorrectChars(c => c + 1);
      toast.success(`+${points} points !`);
      
      setCurrentIndex(i => i + 1);
      setCurrentText(getRandomSnippet());
      setUserInput('');
    } else if (currentText.startsWith(value)) {
      // Correct so far
      setCorrectChars(c => c + 1);
    }
  };

  const getCharacterClass = (index: number) => {
    if (index >= userInput.length) return 'text-muted-foreground';
    if (userInput[index] === currentText[index]) return 'text-success';
    return 'text-destructive bg-destructive/20';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="card-base p-3 text-center">
          <Zap className="w-4 h-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
        <div className="card-base p-3 text-center">
          <Clock className="w-4 h-4 mx-auto mb-1 text-accent" />
          <p className={`text-xl font-bold ${time <= 10 ? 'text-destructive' : ''}`}>{time}s</p>
          <p className="text-xs text-muted-foreground">Temps</p>
        </div>
        <div className="card-base p-3 text-center">
          <Keyboard className="w-4 h-4 mx-auto mb-1 text-warning" />
          <p className="text-xl font-bold">{wpm}</p>
          <p className="text-xs text-muted-foreground">MPM</p>
        </div>
        <div className="card-base p-3 text-center">
          <Trophy className="w-4 h-4 mx-auto mb-1 text-success" />
          <p className="text-xl font-bold">{accuracy}%</p>
          <p className="text-xs text-muted-foreground">Précision</p>
        </div>
      </div>

      {gameComplete ? (
        <div className="card-base p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Temps écoulé ! ⌨️</h2>
          <p className="text-muted-foreground mb-6">
            Vous avez tapé {currentIndex} extraits de code
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-3xl font-bold gradient-text">{score}</p>
              <p className="text-sm text-muted-foreground">points</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-3xl font-bold gradient-text">{wpm}</p>
              <p className="text-sm text-muted-foreground">mots/min</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Précision finale : {accuracy}%
          </p>

          <Button onClick={initializeGame} size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Rejouer
          </Button>
        </div>
      ) : (
        <div className="card-base p-6">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Tapez le code ci-dessous le plus vite possible
          </p>

          {/* Code to type */}
          <div className="bg-muted/50 rounded-xl p-4 mb-6 font-mono text-lg overflow-x-auto">
            {currentText.split('').map((char, index) => (
              <span key={index} className={getCharacterClass(index)}>
                {char}
              </span>
            ))}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full bg-background border border-border rounded-xl p-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Commencez à taper..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          <p className="text-xs text-muted-foreground text-center mt-4">
            Snippet {currentIndex + 1} • MPM = Mots par minute
          </p>
        </div>
      )}

      {/* Restart */}
      {!gameComplete && (
        <div className="text-center mt-6">
          <Button variant="outline" onClick={initializeGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer
          </Button>
        </div>
      )}
    </div>
  );
}
