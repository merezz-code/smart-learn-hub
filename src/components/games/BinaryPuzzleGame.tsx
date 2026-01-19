import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw, CheckCircle2, XCircle, Info } from "lucide-react";

export function BinaryPuzzleGame() {
  const size = 4;
  const [grid, setGrid] = useState<(number | null)[][]>([]);
  const [initialGrid, setInitialGrid] = useState<(number | null)[][]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const generatePuzzle = useCallback(() => {
    const solutions = [
      [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0], [0, 0, 1, 1]],
      [[1, 1, 0, 0], [0, 0, 1, 1], [0, 1, 1, 0], [1, 0, 0, 1]],
      [[0, 1, 0, 1], [1, 0, 1, 0], [1, 1, 0, 0], [0, 0, 1, 1]],
      [[1, 0, 0, 1], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 1, 1]]
    ];
    
    const solution = solutions[Math.floor(Math.random() * solutions.length)];
    const puzzle = solution.map(row => 
      row.map(val => (Math.random() > 0.5 ? val : null))
    );

    setInitialGrid(puzzle.map(r => [...r]));
    setGrid(puzzle.map(r => [...r]));
    setStatus('playing');
  }, []);

  useEffect(() => { generatePuzzle(); }, [generatePuzzle]);

  // Vérification des erreurs immédiates (3 de suite ou quota dépassé)
  const checkErrors = (g: (number | null)[][]) => {
    for (let i = 0; i < size; i++) {
      const row = g[i];
      const col = g.map(r => r[i]);

      // Vérification 3 de suite
      for (let j = 0; j < size - 2; j++) {
        if (row[j] !== null && row[j] === row[j+1] && row[j] === row[j+2]) return true;
        if (col[j] !== null && col[j] === col[j+1] && col[j] === col[j+2]) return true;
      }

      // Vérification quota (pas plus de 2 zéros ou 2 uns)
      if (row.filter(v => v === 0).length > 2 || row.filter(v => v === 1).length > 2) return true;
      if (col.filter(v => v === 0).length > 2 || col.filter(v => v === 1).length > 2) return true;
    }
    return false;
  };

  const checkVictory = (g: (number | null)[][]) => {
    if (g.flat().some(v => v === null)) return false;
    // Si c'est plein et qu'il n'y a pas d'erreurs de triplés/quotas
    return !checkErrors(g);
  };

  const update = (r: number, c: number) => {
    if (status !== 'playing' || initialGrid[r][c] !== null) return;
    
    const newGrid = grid.map(row => [...row]);
    const val = newGrid[r][c];
    newGrid[r][c] = val === null ? 0 : val === 0 ? 1 : null;
    
    setGrid(newGrid);

    if (newGrid[r][c] !== null && checkErrors(newGrid)) {
      setStatus('lost');
      toast.error("Règle non respectée !");
    } else if (checkVictory(newGrid)) {
      setStatus('won');
      toast.success("Félicitations !");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Instructions */}
      <div className="bg-slate-50 border p-3 rounded-xl text-xs text-slate-600 flex gap-2 items-start shadow-sm">
        <Info className="w-4 h-4 mt-0.5 text-blue-500" />
        <div>
          <p className="font-bold">Rappel :</p>
          <p>Pas plus de deux 0 ou 1 consécutifs. Chaque ligne/colonne doit avoir deux 0 et deux 1.</p>
        </div>
      </div>

      

      {/* Grille */}
      <div className={`grid grid-cols-4 gap-2 p-4 rounded-2xl transition-all duration-300 shadow-lg
        ${status === 'lost' ? "bg-red-50 border-red-200" : "bg-slate-100"}`}>
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isFixed = initialGrid[r][c] !== null;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => update(r, c)}
                className={`aspect-square rounded-xl text-2xl font-black transition-all transform active:scale-95 shadow-sm
                  ${isFixed ? "bg-slate-300 text-slate-600" : 
                    val === null ? "bg-white border-2 border-slate-200" : "bg-primary text-white"}
                  ${status === 'lost' && !isFixed && val !== null ? "bg-red-500 border-none shadow-red-200" : ""}
                  ${status === 'won' ? "bg-green-500 border-none" : ""}
                `}
              >
                {val}
              </button>
            );
          })
        )}
      </div>

      {/* Messages de Statut */}
      <div className="min-h-[60px] flex items-center justify-center">
        {status === 'won' && (
          <div className="flex flex-col items-center text-green-600 animate-in zoom-in">
            <CheckCircle2 className="w-10 h-10 mb-1" />
            <span className="font-black text-xl">RÉUSSI !</span>
          </div>
        )}
        {status === 'lost' && (
          <div className="flex flex-col items-center text-red-600 animate-in shake">
            <XCircle className="w-10 h-10 mb-1" />
            <span className="font-black text-xl uppercase tracking-tighter">ÉCHEC : Règle brisée</span>
          </div>
        )}
      </div>

      <Button 
        onClick={generatePuzzle} 
        className="w-full h-12 gap-2 text-lg shadow-md"
        variant={status === 'lost' ? "destructive" : "default"}
      >
        <RotateCcw className="w-5 h-5" />
        {status === 'lost' ? "Réessayer" : "Nouveau Challenge"}
      </Button>
    </div>
  );
}