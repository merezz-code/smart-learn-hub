// backend/routes/auth.routes.js
import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { registerSchema, loginSchema, validate } from '../validators/validators.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Créer un nouveau compte utilisateur
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body;

  console.log('📝 Tentative d\'inscription:', { name, email });

  try {
    // Créer l'utilisateur
    const user = await User.create({ name, email, password, role: 'student' });
    
    // Générer un token JWT
    const token = generateToken(user);

    console.log('✅ Utilisateur créé:', user.email);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      user,
      token
    });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    
    if (error.message === 'Cet email est déjà utilisé') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

/**
 * POST /api/auth/login
 * Se connecter avec email et mot de passe
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Tentative de connexion:', email);

  try {
    // Trouver l'utilisateur par email
    const user = await User.findByEmail(email);

    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await User.verifyPassword(password, user.password);

    if (!isValidPassword) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = generateToken(user);

    console.log('✅ Connexion réussie:', user.email, '| Rôle:', user.role);

    res.json({
      success: true,
      message: 'Connexion réussie',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('❌ Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user });
  } catch (error) {
    console.error('❌ Erreur /me:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * POST /api/auth/logout
 * Se déconnecter (côté client supprime le token)
 */
router.post('/logout', authenticateToken, (req, res) => {
  console.log('✅ Déconnexion utilisateur:', req.user.email);
  res.json({ success: true, message: 'Déconnexion réussie' });
});

export default router;