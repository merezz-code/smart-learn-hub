// src/lib/supabase.ts - VERSION DÉSACTIVÉE
export const supabase = null;
export const useSupabase = false;

console.log('ℹ️ Supabase désactivé - Utilisation de l\'authentification locale');

// import { createClient } from '@supabase/supabase-js';

// // Récupérer les variables d'environnement
// // Ces variables peuvent être dans .env, .env.local, ou .env.development
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Variables Supabase manquantes. Vérifiez votre fichier .env');
// }

// // Créer le client Supabase
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true
//   }
// });

// // Types pour TypeScript
// export type Database = {
//   public: {
//     Tables: {
//       profiles: {
//         Row: {
//           id: string;
//           email: string;
//           full_name: string | null;
//           avatar_url: string | null;
//           role: 'student' | 'instructor' | 'admin';
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
//         Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
//       };
//       courses: {
//         Row: {
//           id: string;
//           title: string;
//           description: string | null;
//           thumbnail: string | null;
//           instructor_id: string | null;
//           duration: number | null;
//           level: 'debutant' | 'intermediaire' | 'avance' | null;
//           category: string | null;
//           is_published: boolean;
//           created_at: string;
//           updated_at: string;
//         };
//       };
//       user_progress: {
//         Row: {
//           id: string;
//           user_id: string;
//           course_id: string;
//           overall_progress: number;
//           started_at: string;
//           last_accessed_at: string;
//           completed_at: string | null;
//         };
//       };
//     };
//   };
// };