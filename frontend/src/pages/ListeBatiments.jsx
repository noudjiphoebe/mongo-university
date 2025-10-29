import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './ListeBatiments.css'

function ListeBatiments() {
  const [batiments, setBatiments] = useState([])
  const [salles, setSalles] = useState([])
  const [loading, setLoading] = useState(true)
  const [batimentSelectionne, setBatimentSelectionne] = useState(null)

  useEffect(() => {
    fetchBatiments()
  }, [])

  const fetchBatiments = async () => {
    try {
      const [batRes, salRes] = await Promise.all([
        axios.get('/api/batiments'),
        axios.get('/api/salles')
      ])
      setBatiments(batRes.data)
      setSalles(salRes.data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSallesByBatiment = (batimentId) => {
    return salles.filter(salle => salle.batiment_id === batimentId)
  }

  const getStatsBatiment = (batimentId) => {
    const sallesBatiment = getSallesByBatiment(batimentId)
    return {
      totalSalles: sallesBatiment.length,
      sallesCours: sallesBatiment.filter(s => s.type_salle === 'cours').length,
      sallesTP: sallesBatiment.filter(s => s.type_salle === 'laboratoire').length,
      amphis: sallesBatiment.filter(s => s.type_salle === 'amphitheatre').length
    }
  }

  if (loading) {
    return (
      <div className="liste-batiments">
        <div className="loading">Chargement des bâtiments...</div>
      </div>
    )
  }

  return (
    <div className="liste-batiments">
      <div className="page-header">
        <h1>🏢 Liste des bâtiments</h1>
        <p>Gestion des infrastructures pédagogiques</p>
      </div>

      {/* Vue d'ensemble */}
      <div className="batiments-overview">
        <div className="overview-card">
          <h3>{batiments.length}</h3>
          <p>Bâtiments</p>
        </div>
        <div className="overview-card">
          <h3>{salles.length}</h3>
          <p>Salles totales</p>
        </div>
        <div className="overview-card">
          <h3>{salles.filter(s => s.type_salle === 'amphitheatre').length}</h3>
          <p>Amphithéâtres</p>
        </div>
        <div className="overview-card">
          <h3>{salles.filter(s => s.type_salle === 'laboratoire').length}</h3>
          <p>Laboratoires</p>
        </div>
      </div>

      {/* Liste des bâtiments */}
      <div className="batiments-grid">
        {batiments.map(batiment => {
          const stats = getStatsBatiment(batiment.id)
          const sallesBatiment = getSallesByBatiment(batiment.id)
          
          return (
            <div 
              key={batiment.id} 
              className={`batiment-card ${batimentSelectionne === batiment.id ? 'selected' : ''}`}
              onClick={() => setBatimentSelectionne(batiment.id === batimentSelectionne ? null : batiment.id)}
            >
              <div className="batiment-header">
                <h3>{batiment.nom}</h3>
                <div className="batiment-actions">
                  <button className="btn btn-sm btn-outline">
                    📋 Détails
                  </button>
                </div>
              </div>
              
              {batiment.adresse && (
                <div className="batiment-adresse">
                  📍 {batiment.adresse}
                </div>
              )}
              
              <div className="batiment-stats">
                <div className="stat">
                  <strong>{stats.totalSalles}</strong>
                  <span>Salles</span>
                </div>
                <div className="stat">
                  <strong>{stats.sallesCours}</strong>
                  <span>Salles de cours</span>
                </div>
                <div className="stat">
                  <strong>{stats.amphis}</strong>
                  <span>Amphis</span>
                </div>
                <div className="stat">
                  <strong>{stats.sallesTP}</strong>
                  <span>Labos</span>
                </div>
              </div>

              {/* Détails des salles (affichés quand le bâtiment est sélectionné) */}
              {batimentSelectionne === batiment.id && sallesBatiment.length > 0 && (
                <div className="salles-list">
                  <h4>Salles du bâtiment:</h4>
                  <div className="salles-grid">
                    {sallesBatiment.map(salle => (
                      <div key={salle.id} className="salle-item">
                        <div className="salle-info">
                          <strong>{salle.nom}</strong>
                          <span className={`salle-type type-${salle.type_salle}`}>
                            {salle.type_salle}
                          </span>
                        </div>
                        <div className="salle-details">
                          <span>Capacité: {salle.capacite} places</span>
                          {salle.etage && <span>Étage: {salle.etage}</span>}
                        </div>
                        {salle.equipements && (
                          <div className="salle-equipements">
                            <small>Équipements: {salle.equipements}</small>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {batiments.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">🏢</div>
          <h3>Aucun bâtiment enregistré</h3>
          <p>Les bâtiments n'ont pas encore été configurés dans le système</p>
        </div>
      )}
    </div>
  )
}

export default ListeBatiments