import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const conn = await pool.getConnection();
    
    // Rechercher l'utilisateur
    const users = await conn.query(
      `SELECT u.id, u.email, u.mot_de_passe, u.role, u.nom, u.prenom, u.actif,
              e.id as enseignant_id, e.matricule
       FROM utilisateur u 
       LEFT JOIN enseignant e ON u.id = e.utilisateur_id
       WHERE u.email = ?`,
      [email]
    );
    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    if (!user.actif) {
      return res.status(401).json({ error: 'Compte désactivé' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Retourner les informations utilisateur sans le mot de passe
    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      enseignant_id: user.enseignant_id,
      matricule: user.matricule
    };

    res.json({
      token,
      user: userResponse,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const user = await conn.query(
      `SELECT u.id, u.email, u.role, u.nom, u.prenom, u.date_creation,
              e.id as enseignant_id, e.matricule, e.specialite, e.grade
       FROM utilisateur u 
       LEFT JOIN enseignant e ON u.id = e.utilisateur_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    conn.release();

    if (user.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
