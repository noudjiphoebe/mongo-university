import React from 'react'
import { Link } from 'react-router-dom'
import './Unauthorized.css'

function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <div className="error-container">
        <div className="error-icon">🚫</div>
        <h1>Accès Non Autorisé</h1>
        <p className="error-message">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">
            Retour à l'accueil
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Se reconnecter
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized