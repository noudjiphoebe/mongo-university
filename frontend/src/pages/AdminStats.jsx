import React, { useState, useEffect } from 'react'
import './AdminStats.css'

function AdminStats() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  // Données mockées pour la démonstration
  const mockStats = {
    totalEtudiants: 1250,
    totalEnseignants: 85,
    totalCours: 156,
    totalBatiments: 12,
    coursParCategorie: {
      'Informatique': 45,
      'Mathématiques': 32,
      'Physique': 28,
      'Chimie': 25,
      'Biologie': 26
    },
    evolutionInscriptions: [
      { mois: 'Jan', inscriptions: 120 },
      { mois: 'Fév', inscriptions: 150 },
      { mois: 'Mar', inscriptions: 180 },
      { mois: 'Avr', inscriptions: 200 },
      { mois: 'Mai', inscriptions: 190 },
      { mois: 'Jun', inscriptions: 210 }
    ]
  }

  // Fonction pour exporter les données en JSON
  const exportData = () => {
    const data = {
      titre: "Statistiques Université",
      dateExport: new Date().toLocaleDateString('fr-FR'),
      ...stats
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `statistiques-universite-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('✅ Données exportées avec succès! Fichier: ' + link.download);
  };

  // Fonction pour générer un rapport PDF simulé
  const generateReport = () => {
    const reportContent = `
RAPPORT STATISTIQUES UNIVERSITÉ
================================

Date: ${new Date().toLocaleDateString('fr-FR')}

CHIFFRES CLÉS:
- Étudiants: ${stats.totalEtudiants}
- Enseignants: ${stats.totalEnseignants} 
- Cours actifs: ${stats.totalCours}
- Bâtiments: ${stats.totalBatiments}

RÉPARTITION DES COURS:
${Object.entries(stats.coursParCategorie || {}).map(([cat, nb]) => `- ${cat}: ${nb} cours`).join('\n')}

ÉVOLUTION INSCRIPTIONS:
${(stats.evolutionInscriptions || []).map(item => `- ${item.mois}: ${item.inscriptions} inscriptions`).join('\n')}

Généré le: ${new Date().toLocaleString('fr-FR')}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-statistiques-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('📊 Rapport généré avec succès!');
  };

  // Fonction pour actualiser les stats sans recharger la page
  const refreshStats = () => {
    setLoading(true);
    // Simulation d'un appel API pour nouvelles données
    setTimeout(() => {
      const updatedStats = {
        ...mockStats,
        totalEtudiants: mockStats.totalEtudiants + Math.floor(Math.random() * 10),
        totalCours: mockStats.totalCours + Math.floor(Math.random() * 3)
      };
      setStats(updatedStats);
      setLoading(false);
      alert('🔄 Statistiques actualisées!');
    }, 1500);
  };

  useEffect(() => {
    // Simulation du chargement des données
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="admin-stats">
        <div className="page-header">
          <h1>📊 Statistiques</h1>
          <p>Chargement des données en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-stats">
      <div className="page-header">
        <h1>📊 Statistiques de l'Université</h1>
        <p>Vue d'ensemble des données et indicateurs</p>
      </div>

      <div className="admin-content">
        {/* Cartes de statistiques principales */}
        <div className="stats-grid-main">
          <div className="stat-card main-stat">
            <div className="stat-icon">🎓</div>
            <div className="stat-info">
              <h3>Étudiants</h3>
              <p className="stat-number">{stats.totalEtudiants}</p>
              <span className="stat-trend">+5% ce mois</span>
            </div>
          </div>

          <div className="stat-card main-stat">
            <div className="stat-icon">👨‍🏫</div>
            <div className="stat-info">
              <h3>Enseignants</h3>
              <p className="stat-number">{stats.totalEnseignants}</p>
              <span className="stat-trend">+2% ce mois</span>
            </div>
          </div>

          <div className="stat-card main-stat">
            <div className="stat-icon">📚</div>
            <div className="stat-info">
              <h3>Cours actifs</h3>
              <p className="stat-number">{stats.totalCours}</p>
              <span className="stat-trend">+8% ce mois</span>
            </div>
          </div>

          <div className="stat-card main-stat">
            <div className="stat-icon">🏛️</div>
            <div className="stat-info">
              <h3>Bâtiments</h3>
              <p className="stat-number">{stats.totalBatiments}</p>
              <span className="stat-trend">Stable</span>
            </div>
          </div>
        </div>

        {/* Graphiques et données détaillées */}
        <div className="stats-details">
          <div className="card">
            <h3>📈 Répartition des cours par catégorie</h3>
            <div className="categories-list">
              {Object.entries(stats.coursParCategorie).map(([categorie, nombre]) => (
                <div key={categorie} className="category-item">
                  <span className="category-name">{categorie}</span>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ width: `${(nombre / stats.totalCours) * 100}%` }}
                    ></div>
                  </div>
                  <span className="category-count">{nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>📅 Évolution des inscriptions</h3>
            <div className="evolution-chart">
              {stats.evolutionInscriptions.map((item, index) => (
                <div key={item.mois} className="chart-bar">
                  <div 
                    className="chart-fill"
                    style={{ height: `${(item.inscriptions / 250) * 100}%` }}
                  ></div>
                  <span className="chart-label">{item.mois}</span>
                  <span className="chart-value">{item.inscriptions}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides - MAINTENANT FONCTIONNELLES */}
        <div className="stats-actions">
          <div className="card">
            <h3>🚀 Actions Rapides</h3>
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={exportData}
              >
                Exporter les données
              </button>
              <button 
                className="btn btn-secondary"
                onClick={generateReport}
              >
                Générer rapport
              </button>
              <button 
                className="btn btn-secondary"
                onClick={refreshStats}
              >
                Actualiser les stats
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStats