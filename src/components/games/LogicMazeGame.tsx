import { useState, useEffect, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Trophy, Flag, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Point {
  x: number;
  y: number;
}

export function LogicMazeGame() {
  const gridSize = 7;
  const [player, setPlayer] = useState<Point>({ x: 0, y: 0 });
  const [exit, setExit] = useState<Point>({ x: 6, y: 6 });
  const [obstacles, setObstacles] = useState<Point[]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [steps, setSteps] = useState(0);

  const generateLevel = useCallback(() => {
    const newObstacles: Point[] = [];
    const obstacleCount = 10; // Un peu plus d'obstacles pour le challenge
    const startPos = { x: 0, y: 0 };
    const newExit = {
      x: Math.floor(Math.random() * 3) + 4,
      y: Math.floor(Math.random() * 3) + 4
    };

    while (newObstacles.length < obstacleCount) {
      const obs = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
      const isOnSpecial = (obs.x === startPos.x && obs.y === startPos.y) || 
                          (obs.x === newExit.x && obs.y === newExit.y);
      const isDuplicate = newObstacles.some(o => o.x === obs.x && o.y === obs.y);

      if (!isOnSpecial && !isDuplicate) {
        newObstacles.push(obs);
      }
    }

    setPlayer(startPos);
    setExit(newExit);
    setObstacles(newObstacles);
    setStatus('playing');
    setSteps(0);
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const move = (dx: number, dy: number) => {
    if (status !== 'playing') return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;

    // LOGIQUE D'ECHEC
    if (obstacles.some(o => o.x === newX && o.y === newY)) {
      setPlayer({ x: newX, y: newY }); // On déplace quand même pour montrer l'impact
      setStatus('lost');
      toast.error("ÉCHEC : Vous avez touché un obstacle !");
      return;
    }

    setPlayer({ x: newX, y: newY });
    setSteps(s => s + 1);

    if (newX === exit.x && newY === exit.y) {
      setStatus('won');
      toast.success("Félicitations ! Sortie atteinte.");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      switch (e.key) {
        case "ArrowUp": move(0, -1); break;
        case "ArrowDown": move(0, 1); break;
        case "ArrowLeft": move(-1, 0); break;
        case "ArrowRight": move(1, 0); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, status, obstacles]);

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="card-base p-4 flex justify-between items-center font-bold">
        <div className="flex items-center gap-2">
          <Trophy className={`w-5 h-5 ${status === 'won' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
          <span>Pas : {steps}</span>
        </div>
        {status === 'lost' && (
          <div className="flex items-center gap-1 text-red-500 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span>GAME OVER</span>
          </div>
        )}
      </div>

      <div className={`card-base p-4 transition-colors duration-500 ${status === 'lost' ? 'bg-red-50' : 'bg-slate-900/5'}`}>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: gridSize }).map((_, y) =>
            Array.from({ length: gridSize }).map((_, x) => {
              const isPlayer = player.x === x && player.y === y;
              const isExit = exit.x === x && exit.y === y;
              const isObstacle = obstacles.some(o => o.x === x && o.y === y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xl transition-all
                    ${isPlayer && status === 'lost' ? "bg-red-500 text-white scale-110 rotate-12" : ""}
                    ${isPlayer && status === 'playing' ? "bg-primary text-primary-foreground scale-110 shadow-lg" : ""}
                    ${isPlayer && status === 'won' ? "bg-green-500 text-white scale-110" : ""}
                    ${isExit ? "bg-green-100 border-2 border-green-500 text-green-600 animate-pulse" : ""}
                    ${isObstacle ? "bg-slate-800 text-slate-400" : "bg-white/50 border border-slate-200"}
                  `}
                >
                  {isPlayer ? (status === 'lost' ? "❌" : "👤") : isExit ? <Flag className="w-4 h-4" /> : isObstacle ? "👾" : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {status !== 'playing' ? (
        <div className={`card-base p-6 text-center animate-in zoom-in ${status === 'lost' ? 'border-red-200' : 'border-green-200'}`}>
          <h2 className={`text-2xl font-black mb-4 ${status === 'lost' ? 'text-red-600' : 'text-green-600'}`}>
            {status === 'lost' ? "MISSION ÉCHOUÉE !" : "MISSION RÉUSSIE !"}
          </h2>
          <Button onClick={generateLevel} size="lg" className="w-full gap-2 text-lg h-14">
            <RotateCcw className="w-5 h-5" />
            Réessayer un nouveau challenge
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => move(0, -1)}><ArrowUp /></Button>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => move(-1, 0)}><ArrowLeft /></Button>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => move(0, 1)}><ArrowDown /></Button>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => move(1, 0)}><ArrowRight /></Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <Button variant="ghost" onClick={generateLevel} className="text-muted-foreground hover:text-primary">
          <RotateCcw className="w-4 h-4 mr-2" />
          Recommencer à tout moment
        </Button>
      </div>
    </div>
  );
}