import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trophy, RotateCcw, ArrowRight, Star, AlertTriangle, CheckCircle } from 'lucide-react';

interface Choice {
  text: string;
  nextSceneId: string;
  points: number;
  feedback: string;
}

interface Scene {
  id: string;
  title: string;
  description: string;
  image?: string;
  choices: Choice[];
  isEnding?: boolean;
}

const scenario: Scene[] = [
  {
    id: 'start',
    title: 'Incident de Sécurité',
    description: 'Vous êtes administrateur système dans une entreprise tech. Un matin, vous recevez une alerte : un comportement suspect a été détecté sur le réseau. Des données semblent être exfiltrées vers une adresse IP inconnue.',
    choices: [
      {
        text: 'Déconnecter immédiatement le serveur suspect',
        nextSceneId: 'disconnect',
        points: 20,
        feedback: 'Bonne initiative ! Isoler la menace limite les dégâts.'
      },
      {
        text: 'Analyser les logs pour comprendre l\'attaque',
        nextSceneId: 'analyze',
        points: 30,
        feedback: 'Excellent ! Comprendre l\'attaque aide à mieux répondre.'
      },
      {
        text: 'Ignorer l\'alerte, c\'est probablement un faux positif',
        nextSceneId: 'ignore',
        points: -20,
        feedback: 'Mauvaise décision ! Ne jamais ignorer une alerte de sécurité.'
      }
    ]
  },
  {
    id: 'disconnect',
    title: 'Serveur Isolé',
    description: 'Le serveur est maintenant déconnecté du réseau. L\'exfiltration de données s\'est arrêtée, mais vous devez maintenant comprendre ce qui s\'est passé et comment l\'attaquant a pu accéder au système.',
    choices: [
      {
        text: 'Faire une copie forensique du disque pour analyse',
        nextSceneId: 'forensic',
        points: 30,
        feedback: 'Parfait ! La forensique préserve les preuves.'
      },
      {
        text: 'Réinstaller le système pour reprendre rapidement',
        nextSceneId: 'reinstall',
        points: 10,
        feedback: 'Rapide mais vous perdez des preuves importantes.'
      }
    ]
  },
  {
    id: 'analyze',
    title: 'Analyse des Logs',
    description: 'En analysant les logs, vous découvrez que l\'attaquant a utilisé des identifiants volés d\'un employé. Le compte compromis avait des privilèges administrateur. L\'attaque semble provenir d\'un email de phishing reçu la semaine dernière.',
    choices: [
      {
        text: 'Révoquer tous les accès du compte compromis',
        nextSceneId: 'revoke',
        points: 25,
        feedback: 'Essentiel ! Cela stoppe l\'attaquant.'
      },
      {
        text: 'Contacter l\'employé pour l\'informer',
        nextSceneId: 'contact',
        points: 15,
        feedback: 'Important, mais pas la priorité immédiate.'
      }
    ]
  },
  {
    id: 'ignore',
    title: 'Catastrophe !',
    description: 'Quelques heures plus tard, toute l\'entreprise est paralysée. Un ransomware a chiffré tous les serveurs. Les attaquants demandent 500 000€ en Bitcoin. L\'alerte que vous avez ignorée était le début de l\'attaque.',
    isEnding: true,
    choices: []
  },
  {
    id: 'forensic',
    title: 'Analyse Forensique',
    description: 'L\'analyse révèle que l\'attaquant a exploité une vulnérabilité connue qui n\'avait pas été patchée. Vous avez maintenant toutes les informations pour prévenir une future attaque.',
    choices: [
      {
        text: 'Rédiger un rapport et planifier les correctifs',
        nextSceneId: 'report',
        points: 30,
        feedback: 'Excellent travail de documentation !'
      }
    ]
  },
  {
    id: 'reinstall',
    title: 'Système Réinstallé',
    description: 'Le système fonctionne à nouveau, mais vous n\'avez aucune idée de comment l\'attaquant est entré. Quelques semaines plus tard, une nouvelle alerte apparaît...',
    isEnding: true,
    choices: []
  },
  {
    id: 'revoke',
    title: 'Accès Révoqués',
    description: 'Tous les accès du compte compromis sont révoqués. L\'attaquant ne peut plus utiliser ces identifiants. Vous devez maintenant sécuriser le système et former les employés.',
    choices: [
      {
        text: 'Organiser une formation anti-phishing pour tous',
        nextSceneId: 'training',
        points: 25,
        feedback: 'La formation est clé pour la sécurité !'
      },
      {
        text: 'Implémenter l\'authentification à deux facteurs',
        nextSceneId: 'mfa',
        points: 30,
        feedback: 'MFA est une des meilleures protections !'
      }
    ]
  },
  {
    id: 'contact',
    title: 'Employé Contacté',
    description: 'L\'employé est informé et coopère. Il reconnaît avoir cliqué sur un lien dans un email suspect. Pendant ce temps, l\'attaquant continue ses actions...',
    choices: [
      {
        text: 'Révoquer immédiatement les accès',
        nextSceneId: 'revoke',
        points: 20,
        feedback: 'Enfin ! Mieux vaut tard que jamais.'
      }
    ]
  },
  {
    id: 'report',
    title: 'Mission Accomplie !',
    description: 'Votre rapport détaillé permet à l\'équipe de corriger toutes les vulnérabilités. Des procédures de sécurité renforcées sont mises en place. L\'entreprise est maintenant mieux protégée.',
    isEnding: true,
    choices: []
  },
  {
    id: 'training',
    title: 'Formation Réussie',
    description: 'Tous les employés ont suivi la formation. Les tentatives de phishing ont chuté de 80%. Vous avez créé une culture de sécurité dans l\'entreprise.',
    isEnding: true,
    choices: []
  },
  {
    id: 'mfa',
    title: 'Sécurité Renforcée',
    description: 'L\'authentification à deux facteurs est déployée sur tous les comptes. Même si un mot de passe est volé, l\'attaquant ne peut plus accéder au système. Excellente décision !',
    isEnding: true,
    choices: []
  }
];

export function ScenarioGame() {
  const [currentSceneId, setCurrentSceneId] = useState('start');
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<string[]>(['start']);
  const [feedback, setFeedback] = useState<{ text: string; points: number } | null>(null);

  const currentScene = scenario.find(s => s.id === currentSceneId)!;

  const handleChoice = (choice: Choice) => {
    setScore(s => s + choice.points);
    setFeedback({ text: choice.feedback, points: choice.points });
    
    setTimeout(() => {
      setCurrentSceneId(choice.nextSceneId);
      setHistory(h => [...h, choice.nextSceneId]);
      setFeedback(null);
    }, 2000);
  };

  const resetGame = () => {
    setCurrentSceneId('start');
    setScore(0);
    setHistory(['start']);
    setFeedback(null);
  };

  const getFinalRating = () => {
    if (score >= 80) return { stars: 3, text: 'Expert en sécurité !' };
    if (score >= 50) return { stars: 2, text: 'Bon travail !' };
    if (score >= 20) return { stars: 1, text: 'Peut mieux faire' };
    return { stars: 0, text: 'À retravailler...' };
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score */}
      <div className="card-base p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          <span className="font-semibold">Score : {score}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Étape {history.length} / ~{scenario.filter(s => !s.isEnding).length}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in ${
          feedback.points > 0 
            ? 'bg-success/10 border border-success/20' 
            : 'bg-destructive/10 border border-destructive/20'
        }`}>
          {feedback.points > 0 ? (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          )}
          <div>
            <p className="font-medium">{feedback.points > 0 ? '+' : ''}{feedback.points} points</p>
            <p className="text-sm text-muted-foreground">{feedback.text}</p>
          </div>
        </div>
      )}

      {/* Scene */}
      <div className="card-base p-6">
        <h2 className="text-xl font-bold mb-4">{currentScene.title}</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {currentScene.description}
        </p>

        {currentScene.isEnding ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">Scénario Terminé</h3>
            
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(3)].map((_, i) => (
                <Star 
                  key={i}
                  className={`w-8 h-8 ${
                    i < getFinalRating().stars 
                      ? 'text-warning fill-warning' 
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            
            <p className="text-muted-foreground mb-2">{getFinalRating().text}</p>
            <p className="text-2xl font-bold gradient-text mb-6">{score} points</p>

            <Button onClick={resetGame} className="px-6 py-3 text-lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Rejouer
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentScene.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(choice)}
                disabled={feedback !== null}
                className="w-full text-left p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <span>{choice.text}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Restart */}
      {!currentScene.isEnding && (
        <div className="text-center mt-6">
          <Button onClick={resetGame}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Recommencer
          </Button>
        </div>
      )}
    </div>
  );
}
