import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

export default function Test() {
  const [status, setStatus] = useState<string>('En attente...');
  const [courses, setCourses] = useState<any[]>([]);

  const testConnection = async () => {
    setStatus('🔍 Test en cours...');
    
    try {
      const { data, error } = await supabase.from('courses').select('*');
      
      if (error) {
        setStatus(`❌ Erreur: ${error.message}`);
        console.error(error);
        return;
      }
      
      setStatus(`✅ Connexion réussie ! ${data.length} cours trouvé(s)`);
      setCourses(data);
      
    } catch (err: any) {
      setStatus(`💥 Erreur: ${err.message}`);
      console.error(err);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom max-w-2xl">
          <div className="card-base p-8">
            <h1 className="text-2xl font-bold mb-4">🧪 Test Supabase</h1>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-xl">
                <p className="font-medium mb-2">Statut:</p>
                <p className="text-lg">{status}</p>
              </div>

              {courses.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-xl">
                  <p className="font-medium mb-2">Cours trouvés:</p>
                  <pre className="text-xs overflow-auto max-h-96 bg-background p-4 rounded">
                    {JSON.stringify(courses, null, 2)}
                  </pre>
                </div>
              )}

              <Button onClick={testConnection} className="w-full">
                🔄 Retester la connexion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}