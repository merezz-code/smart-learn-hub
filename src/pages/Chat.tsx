import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
// import { supabase } from '@/lib/supabase';
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react';

/* =======================
   Types
======================= */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp: Date;
}

/* =======================
   Chat Component
======================= */
export default function Chat() {
  const { isAuthenticated, user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Bonjour ${user?.name || ''} 👋  
Je suis **SmartLearn**, votre assistant pédagogique.

🎯 Je réponds **uniquement à partir des cours présents sur la plateforme**.

Comment puis-je vous aider aujourd’hui ?`,
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /* =======================
     Utils
  ======================= */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  const getQueryEmbedding = async (text: string) => {
    const res = await fetch('/api/embedding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    return data.embedding;
  };

  /* =======================
     RAG – Recherche cours
  ======================= */
  const searchCoursesRAG = async (question: string) => {
    const embedding = await getQueryEmbedding(question);

    // const { data, error } = await supabase.rpc('match_courses', {
    //   query_embedding: embedding,
    //   match_threshold: 0.75,
    //   match_count: 3,
    // });

    // if (error) {
    //   console.error(error);
    //   return [];
    // }

    // return data;
  };
  const generateAnswer = (courses: any[], question: string) => {
    return `
📘 **Réponse basée sur les cours**

${courses.map(c => `
🔹 **${c.title}**
${c.content.slice(0, 300)}...
`).join('\n\n')}

📚 Sources :
${courses.map(c => `- ${c.title}`).join('\n')}
`;
  };

  /* =======================
     Send Message
  ======================= */
  // const handleSend = async () => {
  //   if (!inputValue.trim() || isLoading) return;

  //   const userMessage: ChatMessage = {
  //     id: Date.now().toString(),
  //     role: 'user',
  //     content: inputValue.trim(),
  //     timestamp: new Date(),
  //   };

  //   setMessages(prev => [...prev, userMessage]);
  //   setInputValue('');
  //   setIsLoading(true);

  //   const results = await searchCoursesRAG(userMessage.content);

  //   const assistantMessage: ChatMessage = {
  //     id: Date.now().toString(),
  //     role: 'assistant',
  //     content: results.length
  //       ? generateAnswer(results, userMessage.content)
  //       : "❌ Cette information n’est pas présente dans les cours.",
  //     sources: results.map(r => r.title),
  //     timestamp: new Date(),
  //   };




  //   setMessages(prev => [...prev, assistantMessage]);
  //   setIsLoading(false);
  // };
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),          // mieux que Date.now() pour éviter collisions
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Dans Chat.tsx, remplacez la ligne du fetch :
      const res = await fetch('http://localhost:3000/api/rag/ask', { // On force le port 3000
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur ${res.status}`);
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer || "Je n'ai pas trouvé de réponse dans les cours pour le moment.",
        sources: data.sources ?? [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Erreur chat:', err);

      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `❌ ${err.message || "Erreur de connexion au serveur IA"}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    'Qu’est-ce que le Machine Learning ?',
    'Expliquez l’apprentissage supervisé',
    'Différence entre classification et régression',
  ];

  /* =======================
     UI
  ======================= */
  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">

        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur">
          <div className="container-custom py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Bot className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">Assistant IA SmartLearn</h1>
              <p className="text-xs text-muted-foreground">
                🟢 En ligne • RAG pédagogique activé
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="container-custom py-6 space-y-6">

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                  ${msg.role === 'assistant' ? 'gradient-bg' : 'bg-secondary'}`}>
                  {msg.role === 'assistant'
                    ? <Bot className="text-primary-foreground w-4 h-4" />
                    : <User className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-4 text-sm whitespace-pre-wrap
                  ${msg.role === 'assistant'
                    ? 'bg-muted/50 border'
                    : 'gradient-bg text-primary-foreground'}`}>
                  {msg.content}

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                      📚 Sources :
                      <ul className="list-disc ml-4 mt-1">
                        {msg.sources.map((s, i) => (
                          <li key={i}>{s}</li>  // ou <a href={url si tu en as}>{s}</a>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                  <Bot className="text-primary-foreground w-4 h-4" />
                </div>
                <div className="bg-muted/50 border rounded-2xl p-4 text-sm flex gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Recherche dans les cours...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="border-t bg-muted/30">
            <div className="container-custom py-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Questions suggérées
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map(q => (
                  <Button
                    key={q}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t bg-card/50 backdrop-blur">
          <div className="container-custom py-4">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Posez une question liée au cours..."
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Réponses basées exclusivement sur les contenus pédagogiques
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
