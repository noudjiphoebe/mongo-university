const db = require('../config/database');

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT u.*, e.matricule, e.specialite 
      FROM utilisateur u 
      LEFT JOIN enseignant e ON u.id = e.utilisateur_id 
      ORDER BY u.date_creation DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM utilisateur WHERE id = ?', [id]);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};
