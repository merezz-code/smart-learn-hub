// backend/src/db.js
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chemin vers la base de données
const dbPath = join(__dirname, '..', 'database.sqlite');

// Créer la connexion
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur connexion SQLite:', err.message);
  } else {
    console.log('✅ Connecté à SQLite:', dbPath);
  }
});

// Activer les foreign keys
db.run('PRAGMA foreign_keys = ON');

// Export par défaut
export default db;

// Export nommé (pour compatibilité)
export { db };

// Fonction pour ouvrir la DB (pour initDB.js)
export function openDB() {
  return Promise.resolve(db);
}