import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format, parseISO, addDays, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import './DisponibiliteSalles.css'

function DisponibiliteSalles() {
  const [salles, setSalles] = useState([])
  const [cours, setCours] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateDebut, setDateDebut] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [joursSemaine, setJoursSemaine] = useState([])
  const [filtreType, setFiltreType] = useState('')
  const [filtreBatiment, setFiltreBatiment] = useState('')
  const [batiments, setBatiments] = useState([])

  useEffect(() => {
    fetchDonnees()
  }, [dateDebut])

  useEffect(() => {
    genererJoursSemaine()
  }, [dateDebut])

  const fetchDonnees = async () => {
    try {
      const [sallesRes, coursRes, batimentsRes] = await Promise.all([
        axios.get('/api/salles'),
        axios.get('/api/cours'),
        axios.get('/api/batiments')
      ])
      setSalles(sallesRes.data)
      setCours(coursRes.data)
      setBatiments(batimentsRes.data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const genererJoursSemaine = () => {
    const startDate = startOfWeek(parseISO(dateDebut), { weekStartsOn: 1 })
    const jours = []
    
    for (let i = 0; i < 7; i++) {
      jours.push(addDays(startDate, i))
    }
    
    setJoursSemaine(jours)
  }

  const sallesFiltrees = salles.filter(salle => {
    const matchesType = !filtreType || salle.type_salle === filtreType
    const matchesBatiment = !filtreBatiment || salle.batiment_id == filtreBatiment
    return matchesType && matchesBatiment
  })

  const getCoursSalle = (salleId, date) => {
    return cours.filter(c => {
      const coursDate = format(parseISO(c.date_debut), 'yyyy-MM-dd')
      return c.salle_id === salleId && coursDate === format(date, 'yyyy-MM-dd')
    })
  }

  const getStatutCellule = (salleId, date) => {
    const coursDuJour = getCoursSalle(salleId, date)
    
    if (coursDuJour.length > 0) {
      return { type: 'occupee', cours: coursDuJour }
    }
    
    return { type: 'libre', cours: [] }
  }

  const getCreneauxCours = (coursList) => {
    return coursList.map(c => ({
      heure: format(parseISO(c.date_debut), 'HH:mm'),
      matiere: c.matiere_nom,
      enseignant: `${c.enseignant_nom} ${c.enseignant_prenom}`,
      formation: c.filiere_nom
    }))
  }

  const getTypeSalleLabel = (type) => {
    const types = {
      cours: 'Salle de cours',
      laboratoire: 'Laboratoire',
      amphitheatre: 'Amphithéâtre',
      salle_etude: 'Salle d\'étude'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="disponibilite-salles">
        <div className="loading">Chargement des disponibilités...</div>
      </div>
    )
  }

  return (
    <div className="disponibilite-salles">
      <div className="page-header">
        <h1>🏫 Disponibilité des salles</h1>
        <p>Calendrier d'occupation des salles de cours</p>
      </div>

      {/* Contrôles et filtres */}
      <div className="controls-section">
        <div className="filters">
          <div className="filter-group">
            <label>Type de salle:</label>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="cours">Salle de cours</option>
              <option value="laboratoire">Laboratoire</option>
              <option value="amphitheatre">Amphithéâtre</option>
              <option value="salle_etude">Salle d'étude</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Bâtiment:</label>
            <select
              value={filtreBatiment}
              onChange={(e) => setFiltreBatiment(e.target.value)}
            >
              <option value="">Tous les bâtiments</option>
              {batiments.map(batiment => (
                <option key={batiment.id} value={batiment.id}>
                  {batiment.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Semaine du:</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">{sallesFiltrees.length}</span>
            <span className="stat-label">Salles filtrées</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {sallesFiltrees.filter(s => 
                getStatutCellule(s.id, new Date()).type === 'libre'
              ).length}
            </span>
            <span className="stat-label">Libres aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Tableau des disponibilités */}
      <div className="disponibilite-table-container">
        {sallesFiltrees.length > 0 ? (
          <table className="disponibilite-table">
            <thead>
              <tr>
                <th className="salle-header">Salle</th>
                {joursSemaine.map(jour => (
                  <th key={jour.toString()} className="jour-header">
                    <div className="jour-nom">
                      {format(jour, 'EEEE', { locale: fr })}
                    </div>
                    <div className="jour-date">
                      {format(jour, 'dd/MM', { locale: fr })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sallesFiltrees.map(salle => (
                <tr key={salle.id} className="salle-row">
                  <td className="salle-info">
                    <div className="salle-nom">
                      <strong>{salle.nom}</strong>
                    </div>
                    <div className="salle-details">
                      <span className="salle-type">{getTypeSalleLabel(salle.type_salle)}</span>
                      <span className="salle-capacite">Capacité: {salle.capacite}</span>
                      {salle.batiment_nom && (
                        <span className="salle-batiment">Bâtiment: {salle.batiment_nom}</span>
                      )}
                    </div>
                    {salle.equipements && (
                      <div className="salle-equipements">
                        <small>Équipements: {salle.equipements}</small>
                      </div>
                    )}
                  </td>
                  
                  {joursSemaine.map(jour => {
                    const statut = getStatutCellule(salle.id, jour)
                    const creneaux = getCreneauxCours(statut.cours)
                    
                    return (
                      <td 
                        key={jour.toString()} 
                        className={`statut-cell ${statut.type}`}
                        title={statut.type === 'occupee' ? 
                          `Cours programmés: ${creneaux.map(c => `${c.heure} - ${c.matiere}`).join(', ')}` : 
                          'Salle libre'
                        }
                      >
                        {statut.type === 'occupee' && (
                          <div className="occupation-details">
                            <div className="occupation-count">
                              {creneaux.length} cours
                            </div>
                            <div className="occupation-times">
                              {creneaux.slice(0, 2).map((creneau, index) => (
                                <div key={index} className="time-slot">
                                  {creneau.heure}
                                </div>
                              ))}
                              {creneaux.length > 2 && (
                                <div className="more-times">
                                  +{creneaux.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {statut.type === 'libre' && (
                          <div className="libre-label">
                            ✅ Libre
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <div className="no-data-icon">🏫</div>
            <h3>Aucune salle ne correspond aux filtres</h3>
            <p>Modifiez vos critères de recherche pour afficher des résultats</p>
          </div>
        )}
      </div>

      {/* Résumé par type de salle */}
      <div className="summary-section">
        <h3>Répartition par type de salle</h3>
        <div className="type-summary">
          {['cours', 'laboratoire', 'amphitheatre', 'salle_etude'].map(type => {
            const count = sallesFiltrees.filter(s => s.type_salle === type).length
            if (count === 0) return null
            
            return (
              <div key={type} className="type-item">
                <span className="type-name">{getTypeSalleLabel(type)}</span>
                <span className="type-count">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="legende">
        <h4>Légende:</h4>
        <div className="legende-items">
          <div className="legende-item">
            <span className="couleur-legende libre"></span>
            <span>Salle libre</span>
          </div>
          <div className="legende-item">
            <span className="couleur-legende occupee"></span>
            <span>Salle occupée</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisponibiliteSalles