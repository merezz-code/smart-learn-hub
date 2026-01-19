import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Code, CheckCircle, AlertTriangle, Star, ArrowRight } from "lucide-react";

interface AlgoQuestion {
  code: string;
  options: string[];
  correct: string;
  points: number;
  feedback: string;
}

const allQuestions: AlgoQuestion[] = [
  { code: "let a = 10; \nlet b = '10'; \nconsole.log(a == b);", options: ["true", "false", "undefined"], correct: "true", points: 10, feedback: "L'opérateur == compare les valeurs après conversion automatique (coercition)." },
  { code: "const colors = ['red', 'green']; \ncolors.push('blue'); \nconsole.log(colors.length);", options: ["2", "3", "4"], correct: "3", points: 10, feedback: "push() ajoute un élément à la fin du tableau et augmente sa taille." },
  { code: "console.log(typeof NaN);", options: ["number", "NaN", "undefined"], correct: "number", points: 15, feedback: "NaN (Not a Number) est techniquement considéré comme un type numérique en JS." },
  { code: "let x = 3; \nconst y = x++; \nconsole.log(y);", options: ["3", "4", "undefined"], correct: "3", points: 20, feedback: "Le post-incrément x++ renvoie la valeur actuelle avant d'incrémenter." },
  { code: "const nums = [1, 2, 3]; \nconst res = nums.map(x => x * 2); \nconsole.log(res);", options: ["[2, 4, 6]", "[1, 2, 3]", "[2, 2, 2]"], correct: "[2, 4, 6]", points: 15, feedback: "map() transforme chaque élément et retourne un nouveau tableau." },
  { code: "console.log(3 + 2 + '7');", options: ["12", "57", "NaN"], correct: "57", points: 15, feedback: "3+2 font 5, puis l'addition avec une chaîne '7' provoque une concaténation." },
  { code: "const user = { name: 'Alice' }; \ndelete user.name; \nconsole.log(user.name);", options: ["null", "undefined", "''"], correct: "undefined", points: 15, feedback: "Accéder à une propriété supprimée renvoie toujours undefined." },
  { code: "const isValid = true && false || true; \nconsole.log(isValid);", options: ["true", "false", "null"], correct: "true", points: 10, feedback: "Le ET (&&) est prioritaire sur le OU (||)." },
  { code: "[1, 2, 3].filter(x => x > 1);", options: ["[2, 3]", "[1]", "[1, 2, 3]"], correct: "[2, 3]", points: 15, feedback: "filter() ne garde que les éléments validant la condition fournie." },
  { code: "console.log(greet); \nvar greet = 'Hi';", options: ["'Hi'", "ReferenceError", "undefined"], correct: "undefined", points: 20, feedback: "C'est le hoisting : la variable est déclarée mais pas encore assignée." },
  { code: "const multiply = (a, b = 2) => a * b; \nconsole.log(multiply(5));", options: ["5", "10", "NaN"], correct: "10", points: 15, feedback: "La valeur par défaut b=2 est utilisée car le second argument manque." },
  { code: "const arr = [1, 2]; \nconst [a, b] = arr; \nconsole.log(a);", options: ["1", "2", "undefined"], correct: "1", points: 15, feedback: "C'est la déstructuration de tableau : 'a' prend la première valeur." },
  { code: "JSON.parse('{\"status\": true}').status;", options: ["true", "'true'", "undefined"], correct: "true", points: 20, feedback: "JSON.parse transforme une chaîne JSON en véritable objet JS." },
  { code: "let count = 0; \n(function() { \n  let count = 1; \n})(); \nconsole.log(count);", options: ["0", "1", "ReferenceError"], correct: "0", points: 20, feedback: "La variable 'count' à l'intérieur est locale à la fonction (scope)." },
  { code: "Math.floor(4.9) === Math.ceil(4.1);", options: ["true", "false", "undefined"], correct: "false", points: 15, feedback: "Math.floor(4.9) = 4, alors que Math.ceil(4.1) = 5." },
  { code: "let s = 'hello'; \nconsole.log(s.split('').reverse().join(''));", options: ["'olleh'", "'hello'", "'h-e-l-l-o'"], correct: "'olleh'", points: 15, feedback: "Cette chaîne de méthodes est la façon classique d'inverser un texte." },
  { code: "function test() { return; } \nconsole.log(test());", options: ["null", "undefined", "void"], correct: "undefined", points: 10, feedback: "Une fonction qui ne retourne rien de précis renvoie undefined." },
  { code: "const a = [1]; \nconst b = [1]; \nconsole.log(a === b);", options: ["true", "false", "undefined"], correct: "false", points: 20, feedback: "En JS, deux tableaux différents n'occupent pas la même adresse mémoire." }
];

export function AlgoTowerGame() {
  const [questions, setQuestions] = useState<AlgoQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; points: number; isCorrect: boolean } | null>(null);

  const resetGame = useCallback(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setIndex(0);
    setScore(0);
    setIsComplete(false);
    setFeedback(null);
  }, []);

  useEffect(() => { resetGame(); }, [resetGame]);

  const check = (val: string) => {
    if (feedback || isComplete) return;

    const current = questions[index];
    const isCorrect = val === current.correct;
    const gainedPoints = isCorrect ? current.points : 0;

    if (isCorrect) {
      setScore(s => s + gainedPoints);
      toast.success("Correct !");
    } else {
      toast.error("Incorrect !");
    }

    setFeedback({
      text: isCorrect ? current.feedback : `Mauvaise réponse. Solution : ${current.correct}`,
      points: gainedPoints,
      isCorrect
    });

    setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) {
        setIndex(i => i + 1);
      } else {
        setIsComplete(true);
      }
    }, 2000);
  };

  const getFinalRating = () => {
    const maxScore = questions.reduce((acc, q) => acc + q.points, 0);
    const ratio = score / maxScore;
    if (ratio >= 0.8) return { stars: 3, text: 'Maître Algorithmique !' };
    if (ratio >= 0.5) return { stars: 2, text: 'Bon développeur' };
    return { stars: 1, text: 'Continue à t\'entraîner' };
  };

  if (questions.length === 0) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header & Stats toujours visibles */}
      <div className="card-base p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-lg">{score} <span className="text-xs text-muted-foreground uppercase">pts</span></span>
        </div>
        <div className="text-sm font-medium bg-secondary px-4 py-1.5 rounded-full border">
          {isComplete ? "Terminé" : `Question ${index + 1} / ${questions.length}`}
        </div>
      </div>

      {isComplete ? (
        /* --- ECRAN FINAL --- */
        <div className="card-base p-10 text-center animate-in zoom-in duration-300">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-2">Tour Gravie !</h2>
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className={`w-8 h-8 ${i < getFinalRating().stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
            ))}
          </div>
          <p className="text-muted-foreground mb-1">{getFinalRating().text}</p>
          <p className="text-4xl font-black gradient-text mb-8">{score} points</p>
          <Button onClick={resetGame} size="lg" className="gap-2 w-full">
            <RotateCcw className="w-4 h-4" /> Rejouer une partie
          </Button>
        </div>
      ) : (
        /* --- ECRAN DE JEU --- */
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Feedback temporaire */}
          {feedback && (
            <div className={`p-4 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
              feedback.isCorrect ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              {feedback.isCorrect ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
              <div>
                <p className={`font-bold text-sm ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback.isCorrect ? `+${feedback.points} points` : '0 point'}
                </p>
                <p className="text-sm text-muted-foreground leading-snug">{feedback.text}</p>
              </div>
            </div>
          )}

          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <Code className="w-4 h-4" />
              <span className="text-xs font-mono uppercase">Snippet JavaScript</span>
            </div>
            <pre className="bg-slate-950 text-blue-300 p-6 rounded-xl font-mono text-sm overflow-x-auto border-l-4 border-primary shadow-2xl">
              <code>{questions[index].code}</code>
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[index].options.map((opt) => (
              <button
                key={opt}
                disabled={feedback !== null}
                onClick={() => check(opt)}
                className="w-full text-left p-5 rounded-xl border border-border bg-muted/30 hover:bg-primary/5 hover:border-primary/50 transition-all group disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-medium">{opt}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Button recommencer TOUJOURS visible en bas */}
      {!isComplete && (
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={resetGame} className="text-muted-foreground hover:text-primary gap-2">
            <RotateCcw className="w-4 h-4" /> Recommencer la tour
          </Button>
        </div>
      )}
    </div>
  );
}