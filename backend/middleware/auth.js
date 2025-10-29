import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const conn = await pool.getConnection();
    const user = await conn.query(
      `SELECT u.id, u.email, u.role, u.nom, u.prenom, u.actif, e.id as enseignant_id
       FROM utilisateur u 
       LEFT JOIN enseignant e ON u.id = e.utilisateur_id
       WHERE u.id = ? AND u.actif = TRUE`,
      [decoded.userId]
    );
    conn.release();

    if (user.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }
    next();
  };
};
