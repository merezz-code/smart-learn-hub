// backend/scripts/initDB.js
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

console.log('🔄 Initialisation de la base de données...');
console.log('📂 Chemin:', DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erreur connexion:', err);
    process.exit(1);
  }
  console.log('✅ Connecté à SQLite:', DB_PATH);
});

// Activer les foreign keys
db.run('PRAGMA foreign_keys = ON');

// ========================================
// CRÉATION DES TABLES
// ========================================

const tables = [
  // Users
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    avatar TEXT,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Courses
  `CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    instructor TEXT,
    instructor_avatar TEXT,
    thumbnail TEXT,
    price REAL DEFAULT 0,
    published INTEGER DEFAULT 1,
    rating REAL,
    reviews_count INTEGER DEFAULT 0,
    students_count INTEGER DEFAULT 0,
    language TEXT DEFAULT 'fr',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Course Modules
  `CREATE TABLE IF NOT EXISTS course_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  )`,

  // Lessons
  `CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    module_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    content_type TEXT DEFAULT 'text',
    video_url TEXT,
    video_file TEXT,
    video_thumbnail TEXT,
    duration INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_free_preview INTEGER DEFAULT 0,
    has_quiz INTEGER DEFAULT 0,
    quiz_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE SET NULL
  )`,

  // Quizzes
  `CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit INTEGER,
    max_attempts INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
  )`,

  // Questions
  `CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL,
    options TEXT,
    correct_answer TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
  )`,

  // User Progress
  `CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER,
    completed INTEGER DEFAULT 0,
    score REAL,
    time_spent INTEGER DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
  )`,

  // Lesson Notes
  `CREATE TABLE IF NOT EXISTS lesson_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE(user_id, lesson_id)
  )`
];

// Créer les tables
async function createTables() {
  for (const sql of tables) {
    await new Promise((resolve, reject) => {
      db.run(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  console.log('✅ Tables créées');
}

// Créer les utilisateurs par défaut
async function createDefaultUsers() {
  console.log('👥 Création des comptes par défaut...');

  const testPasswordHash = await bcrypt.hash('test123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Vérifier si les utilisateurs existent déjà
  const existing = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email IN (?, ?)', 
      ['test@test.com', 'admin@admin.com'], 
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (existing) {
    console.log('⚠️  Utilisateurs par défaut déjà existants');
    return;
  }

  // Créer utilisateur test
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Test User', 'test@test.com', testPasswordHash, 'student', new Date().toISOString()],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  // Créer utilisateur admin
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (name, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      ['Admin', 'admin@admin.com', adminPasswordHash, 'admin', new Date().toISOString()],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });

  console.log('📋 Comptes créés :');
  console.log('   👤 Étudiant : test@test.com / test123');
  console.log('   👨‍💼 Admin    : admin@admin.com / admin123');
}

// Créer des cours de démonstration
async function createDemoCourses() {
  console.log('📚 Création de cours de démonstration...');

  const courses = [
    {
      title: 'Introduction à React',
      description: 'Apprenez les fondamentaux de React, la bibliothèque JavaScript la plus populaire pour créer des interfaces utilisateur modernes et interactives.',
      short_description: 'Maîtrisez les bases de React',
      category: 'programming',
      level: 'beginner',
      duration: 480,
      instructor: 'Marie Dupont',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      price: 0,
      published: 1,
      rating: 4.8,
      students_count: 1250,
      language: 'fr'
    },
    {
      title: 'Python pour Data Science',
      description: 'Découvrez comment utiliser Python pour analyser des données, créer des visualisations et développer des modèles de machine learning.',
      short_description: 'Analyse de données avec Python',
      category: 'data-science',
      level: 'intermediate',
      duration: 720,
      instructor: 'Jean Martin',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
      price: 0,
      published: 1,
      rating: 4.9,
      students_count: 890,
      language: 'fr'
    }
  ];

  for (const course of courses) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO courses (
          title, description, short_description, category, level, duration,
          instructor, thumbnail, price, published, rating, students_count, language, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course.title, course.description, course.short_description,
          course.category, course.level, course.duration,
          course.instructor, course.thumbnail, course.price,
          course.published, course.rating, course.students_count,
          course.language, new Date().toISOString()
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  console.log('✅ Cours de démonstration créés');
}

// Exécuter l'initialisation
async function init() {
  try {
    await createTables();
    await createDefaultUsers();
    await createDemoCourses();

    console.log('\n✅ Base de données initialisée avec succès !');
    console.log('\n🎉 Vous pouvez maintenant lancer le serveur avec: npm start');
    console.log('\n📋 Pour vous connecter :');
    console.log('   Admin : admin@admin.com / admin123');
    console.log('   Test  : test@test.com / test123\n');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur initialisation:', error);
    db.close();
    process.exit(1);
  }
}

init();