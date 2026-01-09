import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { MemoryGame } from '@/components/games/MemoryGame';
import { WordScrambleGame } from '@/components/games/WordScrambleGame';
import { ScenarioGame } from '@/components/games/ScenarioGame';
import { TypingGame } from '@/components/games/TypingGame';
import {
  Grid3X3,
  Type,
  GitBranch,
  Keyboard,
  ArrowLeft,
  Sigma,
  MousePointerClick,
  Brain,
  Target,
  Zap,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizGame } from '@/components/games/QuizGame';
import { FastClickGame } from '@/components/games/FastClickGame';
import { MathRaceGame } from '@/components/games/MathRaceGame';
import { AlgoTowerGame } from '@/components/games/AlgoTowerGame';
import { BinaryPuzzleGame } from '@/components/games/BinaryPuzzleGame';
import { LogicMazeGame } from '@/components/games/LogicMazeGame';

const games = [
  // ----- FACILE -----
  {
    id: 'memory',
    level: 'easy',
    name: 'Memory',
    description: 'Trouvez les paires tech',
    icon: Grid3X3,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    id: 'scramble',
    level: 'easy',
    name: 'Mots Mélangés',
    description: 'Remettez les lettres en ordre',
    icon: Type,
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  },

  // ----- MOYEN -----
  {
    id: 'scenario',
    level: 'medium',
    name: 'Cyber Scénario',
    description: 'Choisissez la bonne stratégie',
    icon: GitBranch,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    id: 'typing',
    level: 'medium',
    name: 'Code Typing',
    description: 'Tapez du code rapidement',
    icon: Keyboard,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },

  // ----- DIFFICILE -----
  {
    id: 'logicMaze',
    level: 'hard',
    name: 'Labyrinthe Logique',
    description: 'Résolvez un labyrinthe programmé',
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  {
    id: 'binaryPuzzle',
    level: 'hard',
    name: 'Binary Puzzle',
    description: 'Résolvez une grille binaire 0/1',
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'algoTower',
    level: 'hard',
    name: 'Algo Tower',
    description: 'Mini algorithmes à résoudre en temps limité',
    icon: Star,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'quiz',
    level: 'easy',
    name: 'Quiz Tech',
    description: 'Répondez à des questions rapides',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'fastclick',
    level: 'easy',
    name: 'Fast Click',
    description: 'Cliquez le plus vite possible',
    icon: MousePointerClick,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10'
  },
  {
    id: 'mathrace',
    name: 'Math Race',
    level: 'easy',
    description: 'Résolvez des calculs en vitesse',
    icon: Sigma,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  }
];

export default function Game() {
  const { isAuthenticated } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredGames = games.filter(game =>
    filterLevel === 'all' ? true : game.level === filterLevel
  );
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const renderGame = () => {
    switch (selectedGame) {
      case 'memory':
        return <MemoryGame />;
      case 'scramble':
        return <WordScrambleGame />;
      case 'scenario':
        return <ScenarioGame />;
      case 'typing':
        return <TypingGame />;
      case 'quiz':
        return <QuizGame />;
      case 'fastclick':
        return <FastClickGame />;
      case 'mathrace':
        return <MathRaceGame />;
      case 'algoTower':
        return <AlgoTowerGame />;
      case 'binaryPuzzle':
        return <BinaryPuzzleGame />;
      case 'logicMaze':
        return <LogicMazeGame />;
      default:
        return null;
    }
  };

  return (
    <Layout>


      <div className="section-padding">
        <div className="container-custom">
          {selectedGame ? (
            <>
              {/* Back button and title */}
              <div className="mb-8">
                <Button
                  onClick={() => setSelectedGame(null)}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux jeux
                </Button>
                <h1 className="text-3xl font-bold">
                  {games.find(g => g.id === selectedGame)?.name}
                </h1>
              </div>

              {renderGame()}

              {/* Game Info */}
              <div className="max-w-2xl mx-auto mt-8 p-4 rounded-xl bg-muted/50 border border-border">
                <h3 className="font-semibold mb-2">Comment jouer ?</h3>
                {selectedGame === 'memory' && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cliquez sur deux cartes pour les retourner</li>
                    <li>• Si elles correspondent, elles restent visibles</li>
                    <li>• Trouvez toutes les paires en un minimum de coups</li>
                  </ul>
                )}
                {selectedGame === 'scramble' && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Remettez les lettres dans l'ordre</li>
                    <li>• Utilisez l'indice si vous êtes bloqué (-50 pts)</li>
                    <li>• Les séries augmentent votre score</li>
                  </ul>
                )}
                {selectedGame === 'scenario' && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Lisez le scénario attentivement</li>
                    <li>• Choisissez la meilleure action</li>
                    <li>• Vos choix affectent le résultat final</li>
                  </ul>
                )}
                {selectedGame === 'typing' && (
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Tapez le code affiché le plus vite possible</li>
                    <li>• La précision compte autant que la vitesse</li>
                    <li>• MPM = Mots Par Minute</li>
                  </ul>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-2">
                  Mini-Jeux <span className="gradient-text">Éducatifs</span>
                </h1>
                <p className="text-muted-foreground">
                  Apprenez en vous amusant avec nos serious games
                </p>
              </div>
              <div className="flex gap-3 justify-center mb-8">
                <Button onClick={() => setFilterLevel('all')}
                  className={filterLevel === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                  Tous
                </Button>

                <Button onClick={() => setFilterLevel('easy')}
                  className={filterLevel === 'easy' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                  Facile
                </Button>

                <Button onClick={() => setFilterLevel('medium')}
                  className={filterLevel === 'medium' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                  Moyen
                </Button>

                <Button onClick={() => setFilterLevel('hard')}
                  className={filterLevel === 'hard' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}>
                  Difficile
                </Button>
              </div>

              {/* Games Grid */}
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {filteredGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    className="card-base p-6 text-left hover:border-primary/50 transition-all group"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${game.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <game.icon className={`w-7 h-7 ${game.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                    <p className="text-muted-foreground">{game.description}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
