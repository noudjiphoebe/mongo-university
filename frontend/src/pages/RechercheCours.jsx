import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import './RechercheCours.css'

function RechercheCours() {
  const [resultats, setResultats] = useState([])
  const [loading, setLoading] = useState(false)
  const [filieres, setFilieres] = useState([])
  const [enseignants, setEnseignants] = useState([])
  
  const [filtres, setFiltres] = useState({
    filiere_id: '',
    enseignant_id: '',
    date_debut: '',
    date_fin: '',
    type_seance: ''
  })

  useEffect(() => {
    fetchDonneesFiltres()
  }, [])

  const fetchDonneesFiltres = async () => {
    try {
      const [filRes, ensRes] = await Promise.all([
        axios.get('/api/filieres'),
        axios.get('/api/enseignants')
      ])
      setFilieres(filRes.data)
      setEnseignants(ensRes.data)
    } catch (error) {
      console.error('Erreur chargement filtres:', error)
    }
  }

  const handleFiltreChange = (e) => {
    setFiltres({
      ...filtres,
      [e.target.name]: e.target.value
    })
  }

  const rechercherCours = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Construire les paramètres de recherche
      const params = new URLSearchParams()
      
      Object.entries(filtres).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await axios.get(`/api/cours?${params}`)
      setResultats(response.data)
    } catch (error) {
      console.error('Erreur recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const reinitialiserRecherche = () => {
    setFiltres({
      filiere_id: '',
      enseignant_id: '',
      date_debut: '',
      date_fin: '',
      type_seance: ''
    })
    setResultats([])
  }

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString)
      return format(date, "EEEE dd/MM/yyyy 'à' HH:mm", { locale: fr })
    } catch {
      return dateString
    }
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      cours: { class: 'type-cours', text: 'COURS' },
      td: { class: 'type-td', text: 'TD' },
      tp: { class: 'type-tp', text: 'TP' },
      examen: { class: 'type-examen', text: 'EXAMEN' }
    }
    
    const config = typeConfig[type] || typeConfig.cours
    return <span className={`type-badge ${config.class}`}>{config.text}</span>
  }

  return (
    <div className="recherche-cours">
      <div className="page-header">
        <h1>🔍 Recherche de cours</h1>
        <p>Recherchez des cours selon différents critères</p>
      </div>

      {/* Formulaire de recherche */}
      <div className="recherche-form-container">
        <form onSubmit={rechercherCours} className="recherche-form">
          <div className="form-row">
            <div className="form-group">
              <label>Formation</label>
              <select
                name="filiere_id"
                value={filtres.filiere_id}
                onChange={handleFiltreChange}
              >
                <option value="">Toutes les formations</option>
                {filieres.map(filiere => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Enseignant</label>
              <select
                name="enseignant_id"
                value={filtres.enseignant_id}
                onChange={handleFiltreChange}
              >
                <option value="">Tous les enseignants</option>
                {enseignants.map(enseignant => (
                  <option key={enseignant.id} value={enseignant.id}>
                    {enseignant.nom} {enseignant.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Type de séance</label>
              <select
                name="type_seance"
                value={filtres.type_seance}
                onChange={handleFiltreChange}
              >
                <option value="">Tous les types</option>
                <option value="cours">Cours</option>
                <option value="td">TD</option>
                <option value="tp">TP</option>
                <option value="examen">Examen</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date de début</label>
              <input
                type="date"
                name="date_debut"
                value={filtres.date_debut}
                onChange={handleFiltreChange}
              />
            </div>

            <div className="form-group">
              <label>Date de fin</label>
              <input
                type="date"
                name="date_fin"
                value={filtres.date_fin}
                onChange={handleFiltreChange}
              />
            </div>

            <div className="form-group actions">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Recherche...' : '🔍 Rechercher'}
              </button>
              <button 
                type="button" 
                onClick={reinitialiserRecherche}
                className="btn btn-secondary"
              >
                🗑️ Réinitialiser
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Résultats de recherche */}
      <div className="resultats-recherche">
        <h2>Résultats de la recherche ({resultats.length} cours trouvés)</h2>
        
        {resultats.length > 0 ? (
          <div className="cours-cards">
            {resultats.map(cours => (
              <div key={cours.id} className="cours-card">
                <div className="cours-header">
                  <h3>{cours.matiere_nom}</h3>
                  {getTypeBadge(cours.type_seance)}
                </div>
                
                <div className="cours-info">
                  <div className="info-item">
                    <span className="label">👨‍🏫 Enseignant:</span>
                    <span>{cours.enseignant_nom} {cours.enseignant_prenom}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">🏫 Salle:</span>
                    <span>{cours.salle_nom}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">🎓 Formation:</span>
                    <span>{cours.filiere_nom}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">🕐 Horaires:</span>
                    <span>{formatDateTime(cours.date_debut)}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">⏱️ Durée:</span>
                    <span>
                      {format(parseISO(cours.date_debut), 'HH:mm')} - {format(parseISO(cours.date_fin), 'HH:mm')}
                    </span>
                  </div>
                </div>
                
                <div className="cours-actions">
                  <button className="btn btn-sm btn-outline">
                    📋 Détails
                  </button>
                  <button className="btn btn-sm btn-outline">
                    ✏️ Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="no-resultats">
              <div className="no-resultats-icon">🔍</div>
              <h3>Aucun cours trouvé</h3>
              <p>Modifiez vos critères de recherche pour afficher des résultats</p>
            </div>
          )
        )}

        {loading && (
          <div className="loading-resultats">
            <div className="spinner"></div>
            <p>Recherche en cours...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RechercheCours