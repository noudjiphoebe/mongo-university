import pool from '../config/database.js';

export const getRooms = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rooms = await conn.query(
      `SELECT s.*, b.nom as batiment_nom, b.adresse
       FROM salle s 
       JOIN batiment b ON s.batiment_id = b.id
       ORDER BY b.nom, s.nom`
    );
    conn.release();
    res.json(rooms);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await pool.getConnection();
    const rooms = await conn.query(
      `SELECT s.*, b.nom as batiment_nom, b.adresse
       FROM salle s 
       JOIN batiment b ON s.batiment_id = b.id
       WHERE s.id = ?`,
      [id]
    );
    conn.release();

    if (rooms.length === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }

    res.json(rooms[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { nom, capacite, equipements, type_salle, batiment_id, etage } = req.body;

    const conn = await pool.getConnection();
    
    const result = await conn.query(
      'INSERT INTO salle (nom, capacite, equipements, type_salle, batiment_id, etage) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, capacite, equipements, type_salle, batiment_id, etage]
    );

    conn.release();

    res.status(201).json({ 
      message: 'Salle créée avec succès',
      roomId: result.insertId
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const conn = await pool.getConnection();
    
    const allowedFields = ['nom', 'capacite', 'equipements', 'type_salle', 'batiment_id', 'etage'];
    const updateFields = [];
    const updateValues = [];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      conn.release();
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    updateValues.push(id);

    const result = await conn.query(
      `UPDATE salle SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }

    res.json({ message: 'Salle mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();
    
    // Vérifier si la salle est utilisée dans des cours futurs
    const futureCourses = await conn.query(
      'SELECT COUNT(*) as count FROM cours WHERE salle_id = ? AND date_debut > NOW() AND statut != "annule"',
      [id]
    );

    if (futureCourses[0].count > 0) {
      conn.release();
      return res.status(400).json({ error: 'Impossible de supprimer : la salle a des cours planifiés' });
    }

    const result = await conn.query('DELETE FROM salle WHERE id = ?', [id]);
    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }

    res.json({ message: 'Salle supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
