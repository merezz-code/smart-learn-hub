import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function LogicMazeGame() {
  const gridSize = 7;

  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [exit] = useState({ x: 6, y: 6 });
  const obstacles = [
    { x: 2, y: 1 }, { x: 3, y: 3 }, { x: 1, y: 4 },
    { x: 4, y: 2 }, { x: 5, y: 5 }
  ];

  const move = (dx: number, dy: number) => {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return;

    if (obstacles.some(o => o.x === newX && o.y === newY)) {
      toast.error("Obstacle ! Essayez une autre direction.");
      return;
    }

    setPlayer({ x: newX, y: newY });
  };

  useEffect(() => {
    if (player.x === exit.x && player.y === exit.y) {
      toast.success("Bravo ! Vous avez atteint la sortie !");
    }
  }, [player]);

  return (
    <div className="max-w-sm mx-auto text-center">
      <div className="grid grid-cols-7 gap-1 mb-6">
        {Array.from({ length: gridSize }).map((_, y) =>
          Array.from({ length: gridSize }).map((_, x) => {
            const isPlayer = player.x === x && player.y === y;
            const isExit = exit.x === x && exit.y === y;
            const isObstacle = obstacles.some(o => o.x === x && o.y === y);

            return (
              <div
                key={`${x}-${y}`}
                className={`aspect-square rounded-md flex items-center justify-center
                  ${isPlayer ? "bg-blue-500 text-white" : ""}
                  ${isExit ? "bg-green-500 text-white" : ""}
                  ${isObstacle ? "bg-red-500" : ""}
                  ${!isPlayer && !isExit && !isObstacle ? "bg-muted" : ""}
                `}
              >
                {isPlayer ? "👤" : isExit ? "🚪" : ""}
              </div>
            );
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button onClick={() => move(0, -1)}><ArrowUp /></button>
        <button onClick={() => move(0, 1)}><ArrowDown /></button>
        <button onClick={() => move(-1, 0)}><ArrowLeft /></button>
        <button onClick={() => move(1, 0)}><ArrowRight /></button>
      </div>
    </div>
  );
}
