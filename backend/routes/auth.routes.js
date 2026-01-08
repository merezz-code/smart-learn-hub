// backend/routes/auth.routes.js
import express from 'express';
import db from '../src/db.js';
import crypto from 'crypto';

const router = express.Router();

// Hasher un mot de passe
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  console.log('📝 Tentative d\'inscription:', { name, email });

  // Validation
  if (!name || !email || !password) {
    console.log('❌ Champs manquants');
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  if (password.length < 6) {
    console.log('❌ Mot de passe trop court');
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    // Vérifier si l'email existe déjà
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existing) {
      console.log('❌ Email déjà utilisé:', email);
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer l'utilisateur
    const hashedPassword = hashPassword(password);
    
    const userId = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, 'student', new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    const user = {
      id: userId,
      name,
      email,
      role: 'student'
    };

    console.log('✅ Utilisateur créé:', user);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user
    });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Tentative de connexion:', email);

  if (!email || !password) {
    console.log('❌ Champs manquants');
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    const hashedPassword = hashPassword(password);

    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
        [email, hashedPassword],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      console.log('❌ Identifiants incorrects');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    console.log('✅ Connexion réussie:', user.email);

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Non connecté' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Erreur /me:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;