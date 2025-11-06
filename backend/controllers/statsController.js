const db = require('../config/database');

exports.getStatistics = async (req, res) => {
  try {
    console.log('📊 Chargement des statistiques...');
    
    const [
      [users],
      [teachers], 
      [courses],
      [classrooms],
      [upcoming]
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) as count FROM utilisateur WHERE role = "etudiant"'),
      db.execute('SELECT COUNT(*) as count FROM enseignant WHERE actif = TRUE'),
      db.execute('SELECT COUNT(*) as count FROM matiere'),
      db.execute('SELECT COUNT(*) as count FROM cours WHERE statut = "confirme"'),
      db.execute('SELECT COUNT(*) as count FROM cours WHERE date_debut > NOW() AND statut = "confirme"')
    ]);

    const stats = {
      totalStudents: users[0].count || 0,
      totalTeachers: teachers[0].count || 0,
      totalCourses: courses[0].count || 0,
      totalClasses: classrooms[0].count || 0,
      upcomingCourses: upcoming[0].count || 0
    };

    console.log('✅ Statistiques chargées:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Erreur statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur lors du chargement des statistiques',
      details: error.message 
    });
  }
};
