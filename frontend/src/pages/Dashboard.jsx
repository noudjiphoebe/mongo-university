import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentCours, setRecentCours] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursRes] = await Promise.all([
        axios.get('/api/statistiques'),
        axios.get('/api/cours?date_debut=' + new Date().toISOString().split('T')[0])
      ])

      setStats(statsRes.data)
      setRecentCours(coursRes.data.slice(0, 5))
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Chargement du tableau de bord...</div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble du système de gestion universitaire</p>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats?.totalCours || 0}</h3>
            <p>Cours programmés</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3>{stats?.totalEnseignants || 0}</h3>
            <p>Enseignants</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{stats?.totalSalles || 0}</h3>
            <p>Salles disponibles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>{stats?.totalFilieres || 0}</h3>
            <p>Filières</p>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        <h2>Actions rapides</h2>
        <div className="actions-grid">
          <Link to="/cours/nouveau" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Nouveau cours</h3>
            <p>Programmer un nouveau cours</p>
          </Link>

          <Link to="/cours" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Liste des cours</h3>
            <p>Voir tous les cours programmés</p>
          </Link>

          <Link to="/recherche" className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Recherche</h3>
            <p>Rechercher des cours</p>
          </Link>

          <Link to="/salles/disponibilite" className="action-card">
            <div className="action-icon">🏫</div>
            <h3>Disponibilité salles</h3>
            <p>Vérifier les salles libres</p>
          </Link>
        </div>
      </div>

      {/* Cours récents */}
      <div className="recent-cours">
        <h2>Cours du jour</h2>
        {recentCours.length > 0 ? (
          <div className="cours-list">
            {recentCours.map(cours => (
              <div key={cours.id} className="cours-item">
                <div className="cours-info">
                  <h4>{cours.matiere_nom}</h4>
                  <p>{cours.enseignant_nom} {cours.enseignant_prenom} - {cours.salle_nom}</p>
                </div>
                <div className="cours-time">
                  {new Date(cours.date_debut).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Aucun cours programmé pour aujourd'hui</p>
        )}
      </div>
    </div>
  )
}

export default Dashboard