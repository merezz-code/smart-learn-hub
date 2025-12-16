// src/lib/testConnection.ts
import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Test de connexion Supabase...');
  
  try {
    // Test 1: Vérifier les variables d'environnement
    console.log('1️⃣ Variables d\'environnement:');
    console.log('   URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('   Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Définie' : '❌ Manquante');
    
    // Test 2: Connexion à la base de données
    console.log('\n2️⃣ Test de connexion...');
    const { data, error } = await supabase
      .from('courses')
      .select('count');
    
    if (error) {
      console.error('❌ Erreur:', error.message);
      return false;
    }
    
    console.log('✅ Connexion réussie !');
    
    // Test 3: Récupérer les cours
    console.log('\n3️⃣ Récupération des cours...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');
    
    if (coursesError) {
      console.error('❌ Erreur:', coursesError.message);
      return false;
    }
    
    console.log(`✅ ${courses?.length || 0} cours trouvé(s)`);
    console.log('Cours:', courses);
    
    // Test 4: Vérifier les tables
    console.log('\n4️⃣ Vérification des tables...');
    const tables = ['profiles', 'courses', 'modules', 'lessons', 'quizzes', 'questions', 'user_progress'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      console.log(`   ${table}: ${error ? '❌' : '✅'}`);
    }
    
    console.log('\n🎉 Tous les tests sont passés !');
    return true;
    
  } catch (err: any) {
    console.error('💥 Erreur inattendue:', err.message);
    return false;
  }
}

// Rendre disponible dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).testSupabase = testSupabaseConnection;
}