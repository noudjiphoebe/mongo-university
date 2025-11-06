const db = require('../config/database');

exports.getCourses = async (req, res) => {
  try {
    const [courses] = await db.execute(`
      SELECT c.*, m.nom as matiere_nom, f.nom as filiere_nom,
             CONCAT(u.nom, ' ', u.prenom) as enseignant_nom,
             s.nom as salle_nom
      FROM cours c
      JOIN matiere m ON c.matiere_id = m.id
      JOIN filiere f ON c.filiere_id = f.id
      JOIN enseignant e ON c.enseignant_id = e.id
      JOIN utilisateur u ON e.utilisateur_id = u.id
      JOIN salle s ON c.salle_id = s.id
      ORDER BY c.date_debut DESC
    `);
    res.json(courses);
  } catch (error) {
    console.error('Erreur récupération cours:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM cours WHERE id = ?', [id]);
    res.json({ message: 'Cours supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression cours:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { date_debut, date_fin, salle_id, type_seance } = req.body;
    
    await db.execute(
      'UPDATE cours SET date_debut = ?, date_fin = ?, salle_id = ?, type_seance = ? WHERE id = ?',
      [date_debut, date_fin, salle_id, type_seance, id]
    );
    
    res.json({ message: 'Cours modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification cours:', error);
    res.status(500).json({ error: 'Erreur lors de la modification' });
  }
};
