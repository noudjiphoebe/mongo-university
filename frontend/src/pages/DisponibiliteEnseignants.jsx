import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format, parseISO, addDays, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import './DisponibiliteEnseignants.css'

function DisponibiliteEnseignants() {
  const [enseignants, setEnseignants] = useState([])
  const [cours, setCours] = useState([])
  const [indisponibilites, setIndisponibilites] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateDebut, setDateDebut] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [joursSemaine, setJoursSemaine] = useState([])

  useEffect(() => {
    fetchDonnees()
  }, [dateDebut])

  useEffect(() => {
    genererJoursSemaine()
  }, [dateDebut])

  const fetchDonnees = async () => {
    try {
      const [ensRes, coursRes, indispoRes] = await Promise.all([
        axios.get('/api/enseignants'),
        axios.get('/api/cours'),
        axios.get('/api/indisponibilites')
      ])
      setEnseignants(ensRes.data)
      setCours(coursRes.data)
      setIndisponibilites(indispoRes.data || [])
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

  const getCoursEnseignant = (enseignantId, date) => {
    return cours.filter(c => {
      const coursDate = format(parseISO(c.date_debut), 'yyyy-MM-dd')
      return c.enseignant_id === enseignantId && coursDate === format(date, 'yyyy-MM-dd')
    })
  }

  const getIndisponibilitesEnseignant = (enseignantId, date) => {
    return indisponibilites.filter(indispo => {
      const indispoDate = format(parseISO(indispo.date_debut), 'yyyy-MM-dd')
      return indispo.enseignant_id === enseignantId && 
             indispoDate === format(date, 'yyyy-MM-dd') &&
             indispo.statut === 'approuvee'
    })
  }

  const getStatutCellule = (enseignantId, date) => {
    const coursDuJour = getCoursEnseignant(enseignantId, date)
    const indisposDuJour = getIndisponibilitesEnseignant(enseignantId, date)
    
    if (indisposDuJour.length > 0) {
      return { type: 'indisponible', cours: [] }
    }
    
    if (coursDuJour.length > 0) {
      return { type: 'occupe', cours: coursDuJour }
    }
    
    return { type: 'disponible', cours: [] }
  }

  const getCreneauxCours = (coursList) => {
    return coursList.map(c => ({
      heure: format(parseISO(c.date_debut), 'HH:mm'),
      matiere: c.matiere_nom,
      salle: c.salle_nom
    }))
  }

  if (loading) {
    return (
      <div className="disponibilite-enseignants">
        <div className="loading">Chargement des disponibilités...</div>
      </div>
    )
  }

  return (
    <div className="disponibilite-enseignants">
      <div className="page-header">
        <h1>👨‍🏫 Disponibilité des enseignants</h1>
        <p>Calendrier des disponibilités et emplois du temps</p>
      </div>

      {/* Contrôles de date */}
      <div className="calendar-controls">
        <div className="date-selector">
          <label>Semaine du:</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="date-input"
          />
        </div>
        
        <div className="stats-summary">
          <span className="stat">
            <span className="stat-dot disponible"></span>
            Disponible: {enseignants.length}
          </span>
          <span className="stat">
            <span className="stat-dot occupe"></span>
            En cours: {cours.length}
          </span>
          <span className="stat">
            <span className="stat-dot indisponible"></span>
            Indisponible: {indisponibilites.length}
          </span>
        </div>
      </div>

      {/* Tableau des disponibilités */}
      <div className="disponibilite-table-container">
        <table className="disponibilite-table">
          <thead>
            <tr>
              <th className="enseignant-header">Enseignant</th>
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
            {enseignants.map(enseignant => (
              <tr key={enseignant.id} className="enseignant-row">
                <td className="enseignant-info">
                  <div className="enseignant-nom">
                    {enseignant.nom} {enseignant.prenom}
                  </div>
                  {enseignant.specialite && (
                    <div className="enseignant-specialite">
                      {enseignant.specialite}
                    </div>
                  )}
                </td>
                
                {joursSemaine.map(jour => {
                  const statut = getStatutCellule(enseignant.id, jour)
                  const creneaux = getCreneauxCours(statut.cours)
                  
                  return (
                    <td 
                      key={jour.toString()} 
                      className={`statut-cell ${statut.type}`}
                      title={statut.type === 'occupe' ? 
                        `Cours programmés: ${creneaux.map(c => `${c.heure} - ${c.matiere}`).join(', ')}` : 
                        statut.type === 'indisponible' ? 'Indisponible' : 'Disponible'
                      }
                    >
                      {statut.type === 'occupe' && (
                        <div className="creneaux-list">
                          {creneaux.slice(0, 2).map((creneau, index) => (
                            <div key={index} className="creneau-item">
                              <span className="creneau-heure">{creneau.heure}</span>
                              <span className="creneau-matiere">{creneau.matiere}</span>
                            </div>
                          ))}
                          {creneaux.length > 2 && (
                            <div className="plus-creneaux">
                              +{creneaux.length - 2} autres
                            </div>
                          )}
                        </div>
                      )}
                      
                      {statut.type === 'indisponible' && (
                        <div className="indisponible-label">
                          ❌ Indisponible
                        </div>
                      )}
                      
                      {statut.type === 'disponible' && (
                        <div className="disponible-label">
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
      </div>

      {/* Légende */}
      <div className="legende">
        <h4>Légende:</h4>
        <div className="legende-items">
          <div className="legende-item">
            <span className="couleur-legende disponible"></span>
            <span>Disponible</span>
          </div>
          <div className="legende-item">
            <span className="couleur-legende occupe"></span>
            <span>En cours</span>
          </div>
          <div className="legende-item">
            <span className="couleur-legende indisponible"></span>
            <span>Indisponible</span>
          </div>
        </div>
      </div>

      {enseignants.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">👨‍🏫</div>
          <h3>Aucun enseignant trouvé</h3>
          <p>Les enseignants n'ont pas encore été configurés dans le système</p>
        </div>
      )}
    </div>
  )
}

export default DisponibiliteEnseignants