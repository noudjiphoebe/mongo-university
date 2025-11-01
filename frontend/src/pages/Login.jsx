import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('📤 Envoi des données:', { email, password });
      const result = await login(email, password)
      
      if (result.success) {
        console.log('✅ Connexion réussie, redirection...');
        navigate('/')
      } else {
        setError(result.message)
      }
    } catch (error) {
      console.error('💥 Erreur inattendue:', error);
      setError('Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour pré-remplir les comptes de test
  const fillTestAccount = (testEmail, testPassword) => {
    setEmail(testEmail)
    setPassword(testPassword)
  }

  return (
    <div className="login-container">
      {/* PARTIE 1: Image de fond du campus */}
      <div className="login-background">
        <div className="login-overlay"></div>
        {/* Remplacez par votre image de campus */}
        {/* <img src="/images/upm-campus.jpg" alt="Campus UPM" className="campus-image" /> */}
      </div>
      
      <div className="login-form-container">
        <div className="login-form">
          <div className="login-header">
            <div className="university-logo">
              {/* PARTIE 2: Logo UPM - Remplacez par votre image de logo */}
              <div className="logo-image-container">
                <img 
                  src="/images/upm-logo.png" 
                  alt="Logo UPM" 
                  className="university-logo-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="logo-fallback" style={{display: 'none'}}>
                  🏛️ UPM
                </div>
              </div>
              <h1>Université Polytechnique de Mongo</h1>
              <p className="university-motto">Excellence • Innovation • Développement</p>
            </div>
            <h2>Connexion au Système</h2>
            <p>Gestion des Emplois du Temps Universitaires</p>
          </div>
          
          {error && (
            <div className="alert alert-error">
              <strong>Erreur:</strong> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form-content">
            <div className="form-group">
              <label htmlFor="email">
                <span className="label-icon">📧</span>
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.upm.mg"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">
                <span className="label-icon">🔒</span>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Votre mot de passe"
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-login"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p><strong>Comptes de test UPM:</strong></p>
            <div className="test-accounts">
              <button 
                type="button"
                className="test-account-btn"
                onClick={() => fillTestAccount('admin@upm.mg', 'admin123')}
                disabled={loading}
              >
                <span className="account-icon">👨‍💼</span>
                <div className="account-info">
                  <strong>Administrateur</strong>
                  <small>admin@upm.mg</small>
                </div>
              </button>
              
              <button 
                type="button"
                className="test-account-btn"
                onClick={() => fillTestAccount('enseignant@upm.mg', 'enseignant123')}
                disabled={loading}
              >
                <span className="account-icon">👨‍🏫</span>
                <div className="account-info">
                  <strong>Enseignant</strong>
                  <small>enseignant@upm.mg</small>
                </div>
              </button>
              
              <button 
                type="button"
                className="test-account-btn"
                onClick={() => fillTestAccount('etudiant@upm.mg', 'etudiant123')}
                disabled={loading}
              >
                <span className="account-icon">👨‍🎓</span>
                <div className="account-info">
                  <strong>Étudiant</strong>
                  <small>etudiant@upm.mg</small>
                </div>
              </button>
            </div>
            
            <div className="university-info">
              {/* PARTIE 3: Image ou badge de l'université */}
              <div className="university-badge">
                <img 
                  src="/images/upm-badge.png" 
                  alt="Badge UPM" 
                  className="badge-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <p className="university-contact">
                📞 +235 XX XXX XX | ✉️ contact@upm.mg<br/>
                🏛️ Campus Universitaire, BP 123, Mongo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login