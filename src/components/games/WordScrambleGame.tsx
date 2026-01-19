import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trophy, Clock, RotateCcw, Zap, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const techWords = [
  // --- Langages & Web ---
  { word: 'TYPESCRIPT', hint: 'JavaScript avec des types statiques 🛡️' },
  { word: 'JAVASCRIPT', hint: 'Le langage interactif du Web' },
  { word: 'ANGULAR', hint: 'Framework Google pour applications robustes' },
  { word: 'PHP', hint: 'Langage serveur utilisé par WordPress 🐘' },
  
  // --- Infrastructure & Cloud ---
  { word: 'KUBERNETES', hint: 'Orchestration de conteneurs à grande échelle' },
  { word: 'DOCKER', hint: 'Conteneurisation d\'applications 🐳' },
  { word: 'FIREWALL', hint: 'Barrière de sécurité réseau 🧱' },
  { word: 'BACKUP', hint: 'Sauvegarde de données en cas d\'incident' },
  
  // --- Data & IA ---
  { word: 'BIGDATA', hint: 'Traitement de volumes massifs de données' },
  { word: 'PYTHON', hint: 'Le langage roi pour la Data Science 🐍' },
  { word: 'PYTORCH', hint: 'Framework populaire pour le Deep Learning' },
  { word: 'QUERY', hint: 'Requête envoyée à une base de données' },
  
  // --- Développement ---
  { word: 'DEBUGGING', hint: 'Action de traquer et corriger les bugs 🐛' },
  { word: 'COMPILER', hint: 'Traduit le code source en langage machine' },
  { word: 'INTERFACE', hint: 'Le "I" dans API' },
  { word: 'FRONTEND', hint: 'La partie visible d\'un site web' },
  { word: 'BACKEND', hint: 'La logique serveur et base de données' },
  
  // --- Matériel & Réseau ---
  { word: 'PROCESSOR', hint: 'Le cerveau matériel de l\'ordinateur' },
  { word: 'ETHERNET', hint: 'Standard de connexion réseau filaire' },
  { word: 'MOTHERBOARD', hint: 'Carte maîtresse reliant tous les composants' },
  { word: 'FIRMWARE', hint: 'Logiciel ancré directement dans le matériel' },

  // --- Sécurité ---
  { word: 'PHISHING', hint: 'Tentative d\'escroquerie par email 🎣' },
  { word: 'ENCRYPTION', hint: 'Chiffrement des données pour les protéger' },
  { word: 'PASSWORD', hint: 'Clé secrète d\'accès (doit être complexe !)' }
];

const shuffledWords = [...techWords].sort(() => Math.random() - 0.5);

function scrambleWord(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function WordScrambleGame() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentWord = shuffledWords[currentWordIndex];

  const initializeGame = useCallback(() => {
    setCurrentWordIndex(0);
    setScore(0);
    setStreak(0);
    setTime(60);
    setGuess('');
    setShowHint(false);
    setGameComplete(false);
    setGameStarted(true);
    setFeedback(null);
    
    let scrambledWord = scrambleWord(shuffledWords[0].word);
    while (scrambledWord === shuffledWords[0].word) {
      scrambledWord = scrambleWord(shuffledWords[0].word);
    }
    setScrambled(scrambledWord);
  }, []);

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

  const nextWord = useCallback(() => {
    if (currentWordIndex < shuffledWords.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setGuess('');
      setShowHint(false);
      setFeedback(null);
      
      let scrambledWord = scrambleWord(shuffledWords[nextIndex].word);
      while (scrambledWord === shuffledWords[nextIndex].word) {
        scrambledWord = scrambleWord(shuffledWords[nextIndex].word);
      }
      setScrambled(scrambledWord);
    } else {
      setGameComplete(true);
    }
  }, [currentWordIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (guess.toUpperCase() === currentWord.word) {
      const points = showHint ? 50 : 100;
      const streakBonus = streak * 10;
      setScore(s => s + points + streakBonus);
      setStreak(s => s + 1);
      setFeedback('correct');
      toast.success(`+${points + streakBonus} points !`);
      
      setTimeout(() => {
        nextWord();
      }, 1000);
    } else {
      setStreak(0);
      setFeedback('wrong');
      toast.error('Essaie encore !');
      
      setTimeout(() => {
        setFeedback(null);
      }, 500);
    }
  };

  const handleSkip = () => {
    setStreak(0);
    nextWord();
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-base p-4 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{score}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
        <div className="card-base p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className={`text-2xl font-bold ${time <= 10 ? 'text-destructive' : ''}`}>{time}s</p>
          <p className="text-xs text-muted-foreground">Temps</p>
        </div>
        <div className="card-base p-4 text-center">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-warning" />
          <p className="text-2xl font-bold">{streak}</p>
          <p className="text-xs text-muted-foreground">Série</p>
        </div>
      </div>

      {gameComplete ? (
        <div className="card-base p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Temps écoulé ! ⏱️</h2>
          <p className="text-muted-foreground mb-6">
            Vous avez trouvé {currentWordIndex} mots
          </p>
          
          <div className="bg-muted/50 rounded-2xl p-6 mb-6">
            <span className="text-3xl font-bold gradient-text">{score}</span>
            <p className="text-sm text-muted-foreground">points</p>
          </div>

          <Button onClick={initializeGame} className="px-6 py-3 text-lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Rejouer
          </Button>
        </div>
      ) : (
        <div className="card-base p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Mot {currentWordIndex + 1} / {shuffledWords.length}
            </p>
            <div className={`text-4xl font-bold tracking-widest py-4 transition-colors ${
              feedback === 'correct' ? 'text-success' : 
              feedback === 'wrong' ? 'text-destructive' : ''
            }`}>
              {scrambled}
            </div>
          </div>

          {showHint && (
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 text-center">
              <Lightbulb className="w-5 h-5 mx-auto mb-2 text-accent" />
              <p className="text-sm">{currentWord.hint}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Votre réponse..."
              className="text-center text-lg uppercase"
              autoFocus
            />
            
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Valider
              </Button>
              <Button type="button" onClick={handleSkip}>
                <XCircle className="w-4 h-4 mr-2" />
                Passer
              </Button>
            </div>
          </form>

          {!showHint && (
            <Button 
              
              className="w-full mt-4"
              onClick={() => setShowHint(true)}
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Afficher l'indice (-50 pts)
            </Button>
          )}
        </div>
      )}

      {/* Restart */}
      {!gameComplete && (
        <div className="text-center mt-6">
          <Button onClick={initializeGame} >
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer
          </Button>
        </div>
      )}
    </div>
  );
}
