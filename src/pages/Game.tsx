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
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const games = [
  {
    id: 'memory',
    name: 'Memory',
    description: 'Trouvez les paires d\'icônes tech',
    icon: Grid3X3,
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    id: 'scramble',
    name: 'Mots Mélangés',
    description: 'Devinez les termes techniques',
    icon: Type,
    color: 'text-accent',
    bgColor: 'bg-accent/10'
  },
  {
    id: 'scenario',
    name: 'Cyber Scénario',
    description: 'Gérez une crise de sécurité',
    icon: GitBranch,
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    id: 'typing',
    name: 'Code Typing',
    description: 'Tapez du code rapidement',
    icon: Keyboard,
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  }
];

export default function Game() {
  const { isAuthenticated } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

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
                  variant="ghost" 
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

              {/* Games Grid */}
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {games.map((game) => (
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
