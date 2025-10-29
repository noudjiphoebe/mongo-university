import pool from '../config/database.js';

export const getStats = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    // Statistiques des enseignants
    const teacherStats = await conn.query(`
      SELECT 
        e.id,
        u.nom,
        u.prenom,
        COUNT(c.id) as nombre_cours,
        SUM(TIMESTAMPDIFF(HOUR, c.date_debut, c.date_fin)) as heures_total
      FROM enseignant e
      JOIN utilisateur u ON e.utilisateur_id = u.id
      LEFT JOIN cours c ON e.id = c.enseignant_id 
        AND c.statut != 'annule' 
        AND c.date_debut >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY e.id, u.nom, u.prenom
      ORDER BY heures_total DESC
    `);

    // Statistiques des salles
    const roomStats = await conn.query(`
      SELECT 
        s.id,
        s.nom,
        b.nom as batiment,
        COUNT(c.id) as nombre_cours,
        SUM(TIMESTAMPDIFF(HOUR, c.date_debut, c.date_fin)) as heures_utilisation
      FROM salle s
      JOIN batiment b ON s.batiment_id = b.id
      LEFT JOIN cours c ON s.id = c.salle_id 
        AND c.statut != 'annule' 
        AND c.date_debut >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY s.id, s.nom, b.nom
      ORDER BY heures_utilisation DESC
    `);

    // Statistiques générales
    const generalStats = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM utilisateur WHERE actif = TRUE) as total_utilisateurs,
        (SELECT COUNT(*) FROM enseignant) as total_enseignants,
        (SELECT COUNT(*) FROM salle) as total_salles,
        (SELECT COUNT(*) FROM cours WHERE statut != 'annule' AND date_debut >= CURDATE()) as cours_planifies
    `);

    conn.release();

    res.json({
      general: generalStats[0],
      teachers: teacherStats,
      rooms: roomStats
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
