import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ChatMessage } from '@/types';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';

const mockResponses = [
  {
    keywords: ['python', 'variable'],
    response: `En Python, une variable est un espace de stockage nommé qui contient une valeur. 

**Exemple :**
\`\`\`python
nom = "Alice"  # Variable de type string
age = 25       # Variable de type int
\`\`\`

**Source :** Introduction à Python - Chapitre 2, Page 15`,
  },
  {
    keywords: ['fonction', 'def'],
    response: `Une fonction en Python est définie avec le mot-clé \`def\`. Elle permet de regrouper du code réutilisable.

**Exemple :**
\`\`\`python
def saluer(nom):
    return f"Bonjour, {nom}!"

message = saluer("Marie")
print(message)  # Bonjour, Marie!
\`\`\`

**Source :** Introduction à Python - Chapitre 5, Page 42`,
  },
  {
    keywords: ['machine learning', 'ml', 'apprentissage'],
    response: `Le Machine Learning est une branche de l'IA qui permet aux systèmes d'apprendre à partir de données.

**Types principaux :**
1. **Supervisé** : Apprentissage avec des données étiquetées
2. **Non supervisé** : Découverte de patterns sans étiquettes
3. **Par renforcement** : Apprentissage par essai-erreur

**Source :** Machine Learning Fondamentaux - Chapitre 1, Page 8`,
  },
];

export default function Chat() {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Bonjour ${user?.name || ''} ! 👋 Je suis votre assistant d'apprentissage SmartLearn. 

Je peux vous aider à :
- Répondre à vos questions sur les cours
- Expliquer des concepts complexes
- Fournir des exemples de code
- Citer mes sources pour chaque réponse

Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    for (const mock of mockResponses) {
      if (mock.keywords.some(keyword => lowerQuery.includes(keyword))) {
        return mock.response;
      }
    }

    return `Je comprends votre question sur "${query}". 

Malheureusement, je n'ai pas trouvé de source confirmée dans les documents de cours pour répondre précisément à cette question.

⚠️ **Source non confirmée** - Je ne peux pas fournir une réponse fiable sans documentation appropriée.

Je vous suggère de :
1. Consulter les cours liés à ce sujet
2. Reformuler votre question avec plus de détails
3. Vérifier l'orthographe des termes techniques

N'hésitez pas à me poser une autre question !`;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: generateResponse(userMessage.content),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'Comment déclarer une variable en Python ?',
    'Qu\'est-ce que le Machine Learning ?',
    'Expliquez les fonctions en Python',
  ];

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="container-custom py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">Assistant IA SmartLearn</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  En ligne • RAG activé
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="container-custom py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant' 
                    ? 'gradient-bg' 
                    : 'bg-secondary'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <User className="w-4 h-4 text-secondary-foreground" />
                  )}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'assistant'
                    ? 'bg-muted/50 border border-border'
                    : 'gradient-bg text-primary-foreground'
                }`}>
                  <div className={`text-sm whitespace-pre-wrap ${
                    message.role === 'assistant' ? 'prose prose-sm max-w-none' : ''
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted/50 border border-border rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recherche dans les documents...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested Questions (only show at start) */}
        {messages.length <= 1 && (
          <div className="border-t border-border bg-muted/30">
            <div className="container-custom py-4">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Questions suggérées
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(question)}
                    className="text-xs"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border bg-card/50 backdrop-blur">
          <div className="container-custom py-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="pr-12"
                  disabled={isLoading}
                />
              </div>
              <Button 
                onClick={handleSend} 
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Les réponses sont basées sur vos documents de cours
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
