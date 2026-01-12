// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRETf9a1c4e8a7b1d3e6c9f2a4d8e1b7c5';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET non défini dans .env - Utilisation d\'une clé par défaut (NON SÉCURISÉ)');
}

/**
 * Générer un token JWT pour un utilisateur
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware : Vérifier le token JWT
 * Ajoute req.user avec les infos de l'utilisateur
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token manquant',
      message: 'Authentification requise' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token invalide:', error.message);
    return res.status(403).json({ 
      error: 'Token invalide ou expiré',
      message: 'Veuillez vous reconnecter' 
    });
  }
}

/**
 * Middleware : Vérifier le rôle admin
 * Doit être utilisé APRÈS authenticateToken
 */
export async function isAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Non authentifié',
      message: 'Authentification requise' 
    });
  }

  try {
    // Double vérification en base de données pour plus de sécurité
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, role FROM users WHERE id = ?',
        [req.user.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Utilisateur non trouvé',
        message: 'Compte introuvable' 
      });
    }

    if (user.role !== 'admin') {
      console.log(`⛔ Accès admin refusé pour user ${user.id}`);
      return res.status(403).json({ 
        error: 'Accès interdit',
        message: 'Droits administrateur requis' 
      });
    }

    console.log(`✅ Accès admin autorisé pour user ${user.id}`);
    next();
  } catch (error) {
    console.error('❌ Erreur vérification admin:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: 'Impossible de vérifier les permissions' 
    });
  }
}

/**
 * Middleware optionnel : Vérifier le token si présent, mais ne pas bloquer
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalide mais on continue quand même
      console.log('⚠️  Token invalide mais requête autorisée');
    }
  }

  next();
}