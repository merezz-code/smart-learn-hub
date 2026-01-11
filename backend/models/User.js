// backend/models/User.js
import db from '../config/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class User {
  /**
   * Créer un nouvel utilisateur
   */
  static async create(userData) {
    const { name, email, password, role = 'student' } = userData;

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, new Date().toISOString()],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              reject(new Error('Cet email est déjà utilisé'));
            } else {
              reject(err);
            }
          } else {
            console.log('✅ Utilisateur créé:', this.lastID);
            resolve({ 
              id: this.lastID, 
              name, 
              email, 
              role 
            });
          }
        }
      );
    });
  }

  /**
   * Trouver un utilisateur par email
   */
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Trouver un utilisateur par ID
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Récupérer tous les utilisateurs
   */
  static async findAll(filters = {}) {
    let query = 'SELECT id, name, email, role, avatar, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async update(id, userData) {
    const { name, email, bio, avatar } = userData;
    const fields = [];
    const values = [];

    if (name) {
      fields.push('name = ?');
      values.push(name);
    }
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (bio !== undefined) {
      fields.push('bio = ?');
      values.push(bio);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(avatar);
    }

    if (fields.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve({ id, ...userData, changes: this.changes });
        }
      );
    });
  }

  /**
   * Changer le rôle d'un utilisateur
   */
  static async updateRole(id, role) {
    if (!['student', 'admin'].includes(role)) {
      throw new Error('Rôle invalide');
    }

    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET role = ?, updated_at = ? WHERE id = ?',
        [role, new Date().toISOString(), id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Utilisateur non trouvé'));
          else resolve({ id, role });
        }
      );
    });
  }

  /**
   * Supprimer un utilisateur
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) reject(new Error('Utilisateur non trouvé'));
          else resolve({ deleted: this.changes });
        }
      );
    });
  }

  /**
   * Vérifier un mot de passe
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Compter les utilisateurs
   */
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }
}

export default User;