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
    setLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-form-container">
        <div className="login-form">
          <div className="login-header">
            <div className="university-logo">
              <h1>🏛️ Université de Mongo</h1>
            </div>
            <h2>Connexion au système</h2>
            <p>Gestion des emplois du temps universitaires</p>
          </div>
          
          {error && (
            <div className="alert alert-error">
              <strong>Erreur:</strong> {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form-content">
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
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
                'Se connecter'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Comptes de test:</p>
            <ul>
              <li><strong>Admin:</strong> admin@universite.mg / admin123</li>
              <li><strong>Enseignant:</strong> enseignant@universite.mg / enseignant123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login