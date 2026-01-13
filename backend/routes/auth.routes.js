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
router.get('/:id/stats', async (req, res) => {
    const userId = req.params.id;

    try {
        // 1. Calculer les statistiques depuis la table user_progress
        // On récupère le nombre de cours uniques, la moyenne des scores et les cours terminés
        const statsQuery = `
            SELECT 
                COUNT(DISTINCT course_id) as total_courses,
                COUNT(DISTINCT CASE WHEN completed = 1 THEN course_id END) as completed_courses,
                AVG(CASE WHEN score > 0 THEN score END) as average_score
            FROM user_progress 
            WHERE user_id = ?`;

        const [stats] = await db.query(statsQuery, [userId]);

        // 2. Envoyer la réponse formatée pour le CourseService
        res.json({
            user_id: userId,
            total_courses: stats.total_courses || 0,
            completed_courses: stats.completed_courses || 0,
            in_progress_courses: stats.total_courses || 0,
            average_score: stats.average_score || 0,
            total_time_spent: 0,
            current_streak: 1,
            badges: [] // Vous pourrez lier votre table badges ici plus tard
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors du calcul des stats" });
    }
});

router.get('/:id/enrolled-courses', async (req, res) => {
    const userId = req.params.id;
    try {
        // Jointure entre les cours et la progression de l'utilisateur
        const query = `
            SELECT c.*, p.completed, p.score, p.updated_at as last_accessed
            FROM courses c
            INNER JOIN user_progress p ON c.id = p.course_id
            WHERE p.user_id = ?
            GROUP BY c.id`;

        const [courses] = await db.query(query, [userId]);
        
        // On formate pour que le transformateur du frontend s'y retrouve
        const formatted = courses.map(c => ({
            course: c,
            progress: {
                user_id: userId,
                course_id: c.id,
                overall_progress: c.completed ? 100 : 0, // À affiner selon le nombre de leçons
                status: 'in-progress'
            }
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

export default router;