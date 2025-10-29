import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Université de Mongo</h1>
            <span>Système de gestion des emplois du temps</span>
          </div>
          <div className="user-info">
            <span>Bienvenue, {user?.prenom} {user?.nom}</span>
            <span className="role">({user?.role})</span>
            <button onClick={handleLogout} className="btn btn-outline">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            📊 Tableau de bord
          </Link>
          <Link to="/cours" className={`nav-link ${isActive('/cours')}`}>
            📚 Liste des cours
          </Link>
          <Link to="/cours/nouveau" className={`nav-link ${isActive('/cours/nouveau')}`}>
            ➕ Nouveau cours
          </Link>
          <Link to="/recherche" className={`nav-link ${isActive('/recherche')}`}>
            🔍 Recherche
          </Link>
          <Link to="/batiments" className={`nav-link ${isActive('/batiments')}`}>
            🏢 Bâtiments
          </Link>
          <Link to="/enseignants/disponibilite" className={`nav-link ${isActive('/enseignants/disponibilite')}`}>
            👨‍🏫 Disponibilité enseignants
          </Link>
          <Link to="/salles/disponibilite" className={`nav-link ${isActive('/salles/disponibilite')}`}>
            🏫 Disponibilité salles
          </Link>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout