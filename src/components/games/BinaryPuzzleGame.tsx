import { useState } from "react";
import { toast } from "sonner";

export function BinaryPuzzleGame() {
  const initialGrid = [
    [null, 1, null, null],
    [0, null, null, 1],
    [null, null, 1, null],
    [1, null, null, null]
  ];

  const [grid, setGrid] = useState(initialGrid);

  const update = (r: number, c: number, value: 0 | 1) => {
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = value;
    setGrid(newGrid);

    if (checkRules(newGrid)) {
      toast.success("Bravo ! Puzzle résolu !");
    }
  };

  const checkRules = (g: any[][]) => {
    // simple check : no nulls
    return g.flat().every(v => v !== null);
  };

  return (
    <div className="max-w-sm mx-auto grid grid-cols-4 gap-2">
      {grid.map((row, r) =>
        row.map((val, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => update(r, c, val === 1 ? 0 : 1)}
            className="aspect-square bg-muted rounded-lg flex items-center justify-center text-xl"
          >
            {val === null ? "?" : val}
          </button>
        ))
      )}
    </div>
  );
}
