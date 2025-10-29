import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const getUsers = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const users = await conn.query(
      `SELECT u.id, u.email, u.role, u.nom, u.prenom, u.date_creation, u.actif,
              e.id as enseignant_id, e.matricule
       FROM utilisateur u 
       LEFT JOIN enseignant e ON u.id = e.utilisateur_id
       ORDER BY u.nom, u.prenom`
    );
    conn.release();
    res.json(users);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const users = await conn.query(
      `SELECT u.id, u.email, u.role, u.nom, u.prenom, u.date_creation, u.actif,
              e.id as enseignant_id, e.matricule, e.specialite, e.grade, e.telephone, e.bureau
       FROM utilisateur u 
       LEFT JOIN enseignant e ON u.id = e.utilisateur_id
       WHERE u.id = ?`,
      [id]
    );
    conn.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, mot_de_passe, role, nom, prenom, matricule, specialite, grade } = req.body;

    const conn = await pool.getConnection();
    
    // Vérifier si l'email existe déjà
    const existingUser = await conn.query('SELECT id FROM utilisateur WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 12);

    // Créer l'utilisateur
    const userResult = await conn.query(
      'INSERT INTO utilisateur (email, mot_de_passe, role, nom, prenom) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, role, nom, prenom]
    );

    // Si c'est un enseignant, créer l'entrée dans la table enseignant
    if (role === 'enseignant' && matricule) {
      await conn.query(
        'INSERT INTO enseignant (utilisateur_id, matricule, specialite, grade) VALUES (?, ?, ?, ?)',
        [userResult.insertId, matricule, specialite, grade]
      );
    }

    conn.release();

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      userId: userResult.insertId
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const conn = await pool.getConnection();
    
    // Vérifier que l'utilisateur existe
    const existingUser = await conn.query('SELECT * FROM utilisateur WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const allowedFields = ['email', 'role', 'nom', 'prenom', 'actif'];
    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    // Si mot de passe fourni, le hasher
    if (updates.mot_de_passe) {
      const hashedPassword = await bcrypt.hash(updates.mot_de_passe, 12);
      updateFields.push('mot_de_passe = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    updateValues.push(id);

    await conn.query(
      `UPDATE utilisateur SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    conn.release();

    res.json({ message: 'Utilisateur mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();
    
    // Désactiver l'utilisateur plutôt que supprimer
    const result = await conn.query(
      'UPDATE utilisateur SET actif = FALSE WHERE id = ?',
      [id]
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur désactivé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
