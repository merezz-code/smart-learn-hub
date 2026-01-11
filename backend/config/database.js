// backend/config/database.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'database.sqlite');

console.log('📂 Base de données:', DB_PATH);

// Créer et exporter la connexion SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erreur connexion base de données:', err);
    process.exit(1);
  } else {
    console.log('✅ Connecté à SQLite');
    
    // Activer les foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        console.error('❌ Erreur activation foreign keys:', err);
      } else {
        console.log('✅ Foreign keys activées');
      }
    });
  }
});

export default db;