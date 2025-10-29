import pool from '../config/database.js';

export const getTimetable = async (req, res) => {
  try {
    const { filiere, date, salle, enseignant, semestre, annee } = req.query;
    
    let query = `
      SELECT 
        c.id, c.date_debut, c.date_fin, c.type_seance, c.statut,
        m.nom as matiere_nom, m.code as matiere_code,
        u.nom as enseignant_nom, u.prenom as enseignant_prenom,
        s.nom as salle_nom, s.capacite, s.type_salle,
        f.nom as filiere_nom, f.code as filiere_code,
        b.nom as batiment_nom
      FROM cours c
      JOIN matiere m ON c.matiere_id = m.id
      JOIN enseignant e ON c.enseignant_id = e.id
      JOIN utilisateur u ON e.utilisateur_id = u.id
      JOIN salle s ON c.salle_id = s.id
      JOIN batiment b ON s.batiment_id = b.id
      JOIN filiere f ON c.filiere_id = f.id
      WHERE c.statut != 'annule'
    `;

    const params = [];

    if (filiere) {
      query += ' AND f.id = ?';
      params.push(filiere);
    }

    if (date) {
      query += ' AND DATE(c.date_debut) = ?';
      params.push(date);
    }

    if (salle) {
      query += ' AND s.id = ?';
      params.push(salle);
    }

    if (enseignant) {
      query += ' AND e.id = ?';
      params.push(enseignant);
    }

    query += ' ORDER BY c.date_debut';

    const conn = await pool.getConnection();
    const courses = await conn.query(query, params);
    conn.release();

    res.json(courses);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance } = req.body;

    // Vérifier les conflits
    const conn = await pool.getConnection();
    
    // Vérification des conflits avec la procédure stockée
    const conflictResults = await conn.query(
      'CALL verifier_conflits_cours(?, ?, ?, ?, NULL)',
      [salle_id, enseignant_id, date_debut, date_fin]
    );

    // La procédure stockée retourne plusieurs jeux de résultats
    const salleConflict = conflictResults[0][0].conflit_salle;
    const enseignantConflict = conflictResults[1][0].conflit_enseignant;
    const indisponible = conflictResults[2][0].indisponible;

    if (salleConflict > 0) {
      conn.release();
      return res.status(400).json({ error: 'Conflit de salle à cet horaire' });
    }

    if (enseignantConflict > 0) {
      conn.release();
      return res.status(400).json({ error: 'L\'enseignant a déjà un cours à cet horaire' });
    }

    if (indisponible > 0) {
      conn.release();
      return res.status(400).json({ error: 'L\'enseignant est indisponible à cet horaire' });
    }

    // Créer le cours
    const result = await conn.query(
      `INSERT INTO cours (matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [matiere_id, enseignant_id, salle_id, filiere_id, date_debut, date_fin, type_seance, req.user.id]
    );

    conn.release();

    res.status(201).json({
      message: 'Cours créé avec succès',
      courseId: result.insertId
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const conn = await pool.getConnection();
    
    // Vérifier que le cours existe
    const existingCourse = await conn.query(
      'SELECT * FROM cours WHERE id = ?',
      [id]
    );

    if (existingCourse.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    // Mettre à jour le cours
    const allowedFields = ['matiere_id', 'enseignant_id', 'salle_id', 'date_debut', 'date_fin', 'type_seance', 'statut'];
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

    await conn.query(
      `UPDATE cours SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    conn.release();

    res.json({ message: 'Cours mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await pool.getConnection();
    
    const result = await conn.query(
      'UPDATE cours SET statut = "annule", motif_annulation = "Supprimé par l\'administrateur" WHERE id = ?',
      [id]
    );

    conn.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cours non trouvé' });
    }

    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
