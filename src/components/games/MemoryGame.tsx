import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, Clock, RotateCcw, Zap, Target, Star } from 'lucide-react';

interface Tile {
  id: number;
  value: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🐍', '🤖', '💻', '📊', '🧠', '🎯', '⚡', '🔥'];

export function MemoryGame() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [flippedTiles, setFlippedTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const initializeGame = useCallback(() => {
    const shuffledTiles: Tile[] = [];
    const values = [...Array(8).keys()];
    const pairs = [...values, ...values];
    
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    pairs.forEach((value, index) => {
      shuffledTiles.push({
        id: index,
        value,
        isFlipped: false,
        isMatched: false,
      });
    });

    setTiles(shuffledTiles);
    setFlippedTiles([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameComplete(false);
    setTime(0);
    setGameStarted(true);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameComplete) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  useEffect(() => {
    if (matchedPairs === 8) {
      setGameComplete(true);
      const score = Math.max(1000 - (moves * 10) - (time * 2), 100);
      
      if (!bestScore || score > bestScore) {
        setBestScore(score);
        toast.success(`Nouveau record : ${score} points !`);
      } else {
        toast.success('Partie terminée !');
      }
    }
  }, [matchedPairs, moves, time, bestScore]);

  const handleTileClick = (tileId: number) => {
    if (flippedTiles.length >= 2) return;
    
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.isFlipped || tile.isMatched) return;

    const newTiles = tiles.map(t => 
      t.id === tileId ? { ...t, isFlipped: true } : t
    );
    setTiles(newTiles);
    
    const newFlipped = [...flippedTiles, tileId];
    setFlippedTiles(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      
      const [firstId, secondId] = newFlipped;
      const firstTile = newTiles.find(t => t.id === firstId);
      const secondTile = newTiles.find(t => t.id === secondId);

      if (firstTile && secondTile && firstTile.value === secondTile.value) {
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === firstId || t.id === secondId 
              ? { ...t, isMatched: true }
              : t
          ));
          setMatchedPairs(p => p + 1);
          setFlippedTiles([]);
        }, 500);
      } else {
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === firstId || t.id === secondId 
              ? { ...t, isFlipped: false }
              : t
          ));
          setFlippedTiles([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-base p-4 text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold">{moves}</p>
          <p className="text-xs text-muted-foreground">Coups</p>
        </div>
        <div className="card-base p-4 text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-accent" />
          <p className="text-2xl font-bold">{formatTime(time)}</p>
          <p className="text-xs text-muted-foreground">Temps</p>
        </div>
        <div className="card-base p-4 text-center">
          <Target className="w-5 h-5 mx-auto mb-1 text-success" />
          <p className="text-2xl font-bold">{matchedPairs}/8</p>
          <p className="text-xs text-muted-foreground">Paires</p>
        </div>
      </div>

      {/* Game Board */}
      {gameComplete ? (
        <div className="card-base p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Bravo ! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Vous avez terminé en {moves} coups et {formatTime(time)}
          </p>
          
          <div className="bg-muted/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-warning fill-warning" />
              <span className="text-3xl font-bold gradient-text">
                {Math.max(1000 - (moves * 10) - (time * 2), 100)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">points</p>
          </div>

          {bestScore && (
            <p className="text-sm text-muted-foreground mb-6">
              Meilleur score : {bestScore} points
            </p>
          )}

          <Button onClick={initializeGame} size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Rejouer
          </Button>
        </div>
      ) : (
        <div className="card-base p-6">
          <div className="grid grid-cols-4 gap-3">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile.id)}
                disabled={tile.isFlipped || tile.isMatched}
                className={`aspect-square rounded-xl text-3xl font-bold transition-all duration-300 transform ${
                  tile.isFlipped || tile.isMatched
                    ? 'gradient-bg rotate-0 scale-100'
                    : 'bg-muted hover:bg-muted/80 hover:scale-105'
                } ${tile.isMatched ? 'opacity-50' : ''}`}
              >
                {(tile.isFlipped || tile.isMatched) && (
                  <span className="animate-fade-in">{emojis[tile.value]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Restart Button */}
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
