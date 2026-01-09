// backend/src/initDB.js
import { openDB } from './db.js';
import crypto from 'crypto';

async function init() {
  const db = await openDB();

  console.log('🔄 Initialisation de la base de données...');

  /* =======================
     TABLE USERS
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table users créée');

  /* =======================
     TABLE COURSES
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        short_description TEXT,
        category TEXT,
        level TEXT,
        duration INTEGER DEFAULT 0,
        instructor TEXT,
        thumbnail TEXT,
        price REAL DEFAULT 0,
        published INTEGER DEFAULT 1,
        rating REAL,
        students_count INTEGER DEFAULT 0,
        language TEXT DEFAULT 'fr',
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table courses créée');

  /* =======================
     TABLE COURSE_MODULES (Sections)
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS course_modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table course_modules créée');

  /* =======================
     TABLE LESSONS
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        module_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        content_type TEXT DEFAULT 'text',
        video_url TEXT,
        video_file TEXT,
        order_index INTEGER DEFAULT 0,
        duration INTEGER DEFAULT 0,
        is_free_preview INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE SET NULL
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table lessons créée');

  /* =======================
     TABLE QUIZZES
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        lesson_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        passing_score INTEGER DEFAULT 70,
        time_limit INTEGER,
        max_attempts INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table quizzes créée');

  /* =======================
     TABLE QUESTIONS
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'multiple_choice',
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL,
        points INTEGER DEFAULT 1,
        explanation TEXT,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table questions créée');

  /* =======================
     TABLE USER_PROGRESS
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        lesson_id INTEGER,
        quiz_id INTEGER,
        completed INTEGER DEFAULT 0,
        score INTEGER,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table user_progress créée');

  /* =======================
     TABLE LESSON_NOTES (Notes personnelles)
  ======================= */
  await new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS lesson_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        UNIQUE(user_id, lesson_id)
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  console.log('✅ Table lesson_notes créée');

  /* =======================
     UTILISATEUR TEST (Étudiant)
  ======================= */
  const testUser = await new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM users WHERE email = ?",
      ["test@test.com"],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!testUser) {
    const hashedPassword = crypto.createHash('sha256').update('test123').digest('hex');
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ["Test User", "test@test.com", hashedPassword, "student"],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('✅ Utilisateur test créé: test@test.com / test123');
  }

  /* =======================
     UTILISATEUR ADMIN
  ======================= */
  const adminUser = await new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM users WHERE email = ?",
      ["admin@admin.com"],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!adminUser) {
    const hashedPassword = crypto.createHash('sha256').update('admin123').digest('hex');
    
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ["Admin User", "admin@admin.com", hashedPassword, "admin"],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    console.log('✅ Utilisateur admin créé: admin@admin.com / admin123');
  }

  /* =======================
     COURS EXEMPLE COMPLET
  ======================= */
  const existingCourse = await new Promise((resolve, reject) => {
    db.get(
      "SELECT id FROM courses WHERE title = ?",
      ["Introduction à Python"],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  if (!existingCourse) {
    // Créer le cours
    const courseId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO courses (title, category, level, description, short_description, duration, instructor, thumbnail, price, published, content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "Introduction à Python",
          "programming",
          "beginner",
          "Découvrir les bases du langage Python pour devenir un développeur. Ce cours couvre les fondamentaux de la programmation en Python.",
          "Apprenez Python de zéro",
          180, // 3 heures
          "Dr. Marie Dubois",
          "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
          0,
          1,
          "<h2>Bienvenue dans le cours Python</h2><p>Ce cours vous apprendra les bases de Python.</p>"
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Créer un module
    const moduleId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO course_modules (course_id, title, description, order_index)
         VALUES (?, ?, ?, ?)`,
        [
          courseId,
          "Les bases de Python",
          "Découvrez les concepts fondamentaux",
          1
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Créer des leçons
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO lessons (course_id, module_id, title, description, content, content_type, order_index, duration, is_free_preview)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          moduleId,
          "Introduction aux variables",
          "Apprenez à déclarer et utiliser des variables en Python",
          "<h3>Les variables en Python</h3><p>Une variable est un conteneur pour stocker des données.</p><pre><code>x = 10\nnom = 'Alice'\nage = 25</code></pre>",
          "text",
          1,
          30,
          1 // Aperçu gratuit
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO lessons (course_id, module_id, title, description, content, content_type, video_url, order_index, duration)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          moduleId,
          "Les types de données",
          "Découvrez les différents types : int, float, str, bool",
          "<h3>Types de base en Python</h3><p>Python supporte plusieurs types de données : entiers, flottants, chaînes de caractères, booléens.</p><pre><code>age = 25  # int\nprix = 19.99  # float\nnom = 'Python'  # str\nactif = True  # bool</code></pre>",
          "video",
          "https://www.youtube.com/embed/dQw4w9WgXcQ", // Exemple
          2,
          45
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Créer un quiz
    const quizId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO quizzes (course_id, title, description, passing_score, time_limit, max_attempts)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          courseId,
          "Quiz : Les bases de Python",
          "Testez vos connaissances sur les variables et types",
          70,
          10, // 10 minutes
          3   // 3 tentatives max
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // Créer des questions
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, explanation, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          "Quel est le type de la variable x = 10 ?",
          "multiple_choice",
          JSON.stringify([
            { id: "a", text: "int" },
            { id: "b", text: "float" },
            { id: "c", text: "str" },
            { id: "d", text: "bool" }
          ]),
          "a",
          1,
          "10 est un nombre entier, donc son type est int",
          1
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points, explanation, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quizId,
          "Comment déclare-t-on une variable en Python ?",
          "multiple_choice",
          JSON.stringify([
            { id: "a", text: "var x = 10" },
            { id: "b", text: "x = 10" },
            { id: "c", text: "int x = 10" },
            { id: "d", text: "let x = 10" }
          ]),
          "b",
          1,
          "En Python, on déclare simplement : x = 10",
          2
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('✅ Cours exemple créé avec modules, leçons et quiz');
  }

  console.log('✅ Base de données initialisée avec succès !');
  console.log('');
  console.log('📋 Comptes créés :');
  console.log('   👤 Étudiant : test@test.com / test123');
  console.log('   👨‍💼 Admin    : admin@admin.com / admin123');
  console.log('');
  
  process.exit(0);
}

init().catch(err => {
  console.error('❌ Erreur initialisation:', err);
  process.exit(1);
});

// src/initDB.js
// import { openDB } from "./db.js";

// async function init() {
//   const db = await openDB();

//   await db.exec(`
//     CREATE TABLE IF NOT EXISTS courses (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       title TEXT NOT NULL,
//       module TEXT,
//       level TEXT,
//       language TEXT DEFAULT 'fr',
//       content TEXT NOT NULL,
//       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
//       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
//   `);
//   await db.exec(`
//   CREATE TABLE IF NOT EXISTS users (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     name TEXT NOT NULL,
//     email TEXT UNIQUE NOT NULL,
//     password TEXT NOT NULL,
//     role TEXT DEFAULT 'student',
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   );
// `);
// const row = await db.get("SELECT * FROM courses WHERE title = ?", ["Introduction à Python"]);
// if (!row) {
//   await db.run(
//     `INSERT INTO courses (title, module, level, content) VALUES (?, ?, ?, ?)`,
//     ["Introduction à Python", "Programmation", "Débutant", "Une variable en Python est un espace mémoire qui stocke une valeur..."]
//   );
// }



// await db.close();
// console.log("✅ Tables courses et users créées et cours exemple ajouté !");
// process.exit(0);

// }
// init();

