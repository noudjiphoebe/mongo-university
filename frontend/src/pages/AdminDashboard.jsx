import React from 'react'
import { Link } from 'react-router-dom'
import './AdminDashboard.css'

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>🏛️ Administration Université</h1>
        <p>Gestion complète de l'université</p>
      </div>

      <div className="admin-grid">
        {/* Gestion académique */}
        <div className="admin-card">
          <h3>📚 Gestion Académique</h3>
          <div className="card-links">
            <Link to="/cours/nouveau" className="btn btn-primary">Créer un cours</Link>
            <Link to="/cours" className="btn btn-secondary">Liste des cours</Link>
            <Link to="/batiments" className="btn btn-secondary">Gestion des bâtiments</Link>
          </div>
        </div>

        {/* Gestion des ressources */}
        <div className="admin-card">
          <h3>👨‍🏫 Gestion des Ressources</h3>
          <div className="card-links">
            <Link to="/enseignants/disponibilite" className="btn btn-primary">Disponibilités enseignants</Link>
            <Link to="/salles/disponibilite" className="btn btn-secondary">Disponibilités salles</Link>
          </div>
        </div>

        {/* Administration système */}
        <div className="admin-card">
          <h3>⚙️ Administration</h3>
          <div className="card-links">
            <Link to="/recherche" className="btn btn-primary">Recherche avancée</Link>
            <button className="btn btn-secondary">Gestion des utilisateurs</button>
            <button className="btn btn-secondary">Statistiques</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard