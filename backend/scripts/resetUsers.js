// backend/scripts/resetUsers.js
import db from '../config/database.js';
import bcrypt from 'bcrypt';

async function resetUsers() {
  console.log('🔄 Réinitialisation des utilisateurs...');

  try {
    // Supprimer les anciens utilisateurs
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('🗑️  Anciens utilisateurs supprimés');

    // Hasher les mots de passe
    const testPasswordHash = await bcrypt.hash('test123', 10);
    const adminPasswordHash = await bcrypt.hash('admin123', 10);

    // Créer utilisateur test
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role, created_at) 
         VALUES ('Test User', 'test@test.com', ?, 'student', ?)`,
        [testPasswordHash, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else {
            console.log('✅ Utilisateur test créé (ID:', this.lastID, ')');
            resolve();
          }
        }
      );
    });

    // Créer utilisateur admin
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role, created_at) 
         VALUES ('Admin', 'admin@admin.com', ?, 'admin', ?)`,
        [adminPasswordHash, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else {
            console.log('✅ Utilisateur admin créé (ID:', this.lastID, ')');
            resolve();
          }
        }
      );
    });

    console.log('\n📋 Comptes disponibles :');
    console.log('   👤 Étudiant : test@test.com / test123');
    console.log('   👨‍💼 Admin    : admin@admin.com / admin123');
    console.log('\n✅ Réinitialisation terminée !');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

resetUsers();