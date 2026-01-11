// backend/validators/validators.js
import Joi from 'joi';

// ========================================
// VALIDATION UTILISATEUR
// ========================================

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères',
      'any.required': 'Le nom est requis'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Email invalide',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string().min(6).max(100).required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Le mot de passe est requis'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  bio: Joi.string().max(500),
  avatar: Joi.string().uri()
}).min(1);

// ========================================
// VALIDATION COURS
// ========================================

export const courseSchema = Joi.object({
  title: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'Le titre doit contenir au moins 3 caractères',
      'any.required': 'Le titre est requis'
    }),
  description: Joi.string().min(10).required()
    .messages({
      'string.min': 'La description doit contenir au moins 10 caractères',
      'any.required': 'La description est requise'
    }),
  short_description: Joi.string().max(500),
  category: Joi.string()
    .valid('programming', 'design', 'business', 'marketing', 'data-science', 'language', 'other')
    .required()
    .messages({
      'any.only': 'Catégorie invalide',
      'any.required': 'La catégorie est requise'
    }),
  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .required()
    .messages({
      'any.only': 'Niveau invalide (beginner, intermediate, advanced)',
      'any.required': 'Le niveau est requis'
    }),
  duration: Joi.number().min(0).default(0),
  instructor: Joi.string().required(),
  instructor_avatar: Joi.string().uri(),
  thumbnail: Joi.string().uri(),
  price: Joi.number().min(0).default(0),
  published: Joi.boolean().default(true),
  rating: Joi.number().min(0).max(5),
  language: Joi.string().valid('fr', 'en', 'es', 'ar').default('fr')
});

export const publishCourseSchema = Joi.object({
  published: Joi.boolean().required()
});

// ========================================
// VALIDATION MODULE
// ========================================

export const moduleSchema = Joi.object({
  course_id: Joi.number().required()
    .messages({
      'any.required': 'L\'ID du cours est requis'
    }),
  title: Joi.string().min(3).max(200).required()
    .messages({
      'string.min': 'Le titre doit contenir au moins 3 caractères',
      'any.required': 'Le titre est requis'
    }),
  description: Joi.string().max(1000),
  order_index: Joi.number().min(0).default(0)
});

// ========================================
// VALIDATION LEÇON
// ========================================

export const lessonSchema = Joi.object({
  course_id: Joi.number().required(),
  module_id: Joi.number().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow('').optional(),
  content: Joi.string().required()
    .messages({
      'any.required': 'Le contenu de la leçon est requis'
    }),
  content_type: Joi.string()
    .valid('text', 'video', 'mixed')
    .default('text'),
  video_url: Joi.string().uri().allow('').optional(),
  video_thumbnail: Joi.string().uri().allow('').optional(),
  duration: Joi.number().min(0).default(0),
  order_index: Joi.number().min(0).default(0),
  is_free_preview: Joi.boolean().default(false)
});

// ========================================
// VALIDATION QUIZ
// ========================================

export const quizSchema = Joi.object({
  course_id: Joi.number().required(),
  lesson_id: Joi.number().optional(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow('').optional(),
  passing_score: Joi.number().min(0).max(100).default(70)
    .messages({
      'number.min': 'Le score minimum doit être >= 0',
      'number.max': 'Le score maximum doit être <= 100'
    }),
  time_limit: Joi.number().min(0).optional(),
  max_attempts: Joi.number().min(0).optional()
});

// ========================================
// VALIDATION QUESTION
// ========================================

export const questionSchema = Joi.object({
  quiz_id: Joi.number().required(),
  question_text: Joi.string().min(3).required()
    .messages({
      'string.min': 'La question doit contenir au moins 3 caractères',
      'any.required': 'Le texte de la question est requis'
    }),
  question_type: Joi.string()
    .valid('multiple_choice', 'true_false', 'short_answer')
    .default('multiple_choice')
    .messages({
      'any.only': 'Type de question invalide'
    }),
  options: Joi.alternatives().conditional('question_type', {
    is: 'multiple_choice',
    then: Joi.array().items(Joi.string()).min(2).required()
      .messages({
        'array.min': 'Au moins 2 options sont requises pour un QCM',
        'array.base': 'Les options doivent être un tableau de strings'
      }),
    otherwise: Joi.array().items(Joi.string()).optional()
  }),
  correct_answer: Joi.alternatives().try(
    Joi.string(),
    Joi.number(),
    Joi.array().items(Joi.string())
  ).required(),
  points: Joi.number().min(0).default(1),
  explanation: Joi.string().max(1000).allow('').optional(),
  order_index: Joi.number().min(0).default(0)
});

// ========================================
// VALIDATION PROGRESSION
// ========================================

export const progressSchema = Joi.object({
  userId: Joi.number().required(),
  courseId: Joi.number().required(),
  lessonId: Joi.number().required()
});

export const enrollSchema = Joi.object({
  userId: Joi.number().required(),
  courseId: Joi.number().required()
});

// ========================================
// MIDDLEWARE DE VALIDATION
// ========================================

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      console.error('❌ Erreur validation:', errors);
      console.error('📦 Données reçues:', req.body);
      
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors
      });
    }
    
    // Remplacer req.body par les données validées et nettoyées
    req.body = value;
    next();
  };
}