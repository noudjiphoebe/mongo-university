import pool from '../config/database.js';

export const getTeachers = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const teachers = await conn.query(
      `SELECT e.*, u.nom, u.prenom, u.email, u.role
       FROM enseignant e 
       JOIN utilisateur u ON e.utilisateur_id = u.id
       WHERE u.actif = TRUE
       ORDER BY u.nom, u.prenom`
    );
    conn.release();
    res.json(teachers);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const teachers = await conn.query(
      `SELECT e.*, u.nom, u.prenom, u.email, u.role
       FROM enseignant e 
       JOIN utilisateur u ON e.utilisateur_id = u.id
       WHERE e.id = ? AND u.actif = TRUE`,
      [id]
    );
    conn.release();

    if (teachers.length === 0) {
      return res.status(404).json({ error: 'Enseignant non trouvé' });
    }

    res.json(teachers[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const getTeacherAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que l'utilisateur a le droit de voir ces données
    if (req.user.role !== 'admin' && req.user.enseignant_id !== parseInt(id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const conn = await pool.getConnection();
    const availability = await conn.query(
      `SELECT * FROM indisponibilite 
       WHERE enseignant_id = ? 
       ORDER BY date_debut DESC`,
      [id]
    );
    conn.release();

    res.json(availability);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const setTeacherAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_debut, date_fin, raison, description } = req.body;
    
    // Vérifier les permissions
    if (req.user.role !== 'admin' && req.user.enseignant_id !== parseInt(id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const conn = await pool.getConnection();
    
    const result = await conn.query(
      `INSERT INTO indisponibilite (enseignant_id, date_debut, date_fin, raison, description)
       VALUES (?, ?, ?, ?, ?)`,
      [id, date_debut, date_fin, raison, description]
    );

    conn.release();

    res.status(201).json({ 
      message: 'Indisponibilité enregistrée avec succès',
      availabilityId: result.insertId
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
