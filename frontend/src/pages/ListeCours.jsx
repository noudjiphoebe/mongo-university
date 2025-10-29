import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import './ListeCours.css'

function ListeCours() {
  const [cours, setCours] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [filiereFilter, setFiliereFilter] = useState('')
  const [filieres, setFilieres] = useState([])

  useEffect(() => {
    fetchCours()
    fetchFilieres()
  }, [])

  const fetchCours = async () => {
    try {
      const response = await axios.get('/api/cours')
      setCours(response.data)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilieres = async () => {
    try {
      const response = await axios.get('/api/filieres')
      setFilieres(response.data)
    } catch (error) {
      console.error('Erreur filières:', error)
    }
  }

  const filteredCours = cours.filter(coursItem => {
    const matchesSearch = 
      coursItem.matiere_nom?.toLowerCase().includes(filter.toLowerCase()) ||
      coursItem.enseignant_nom?.toLowerCase().includes(filter.toLowerCase()) ||
      coursItem.enseignant_prenom?.toLowerCase().includes(filter.toLowerCase()) ||
      coursItem.salle_nom?.toLowerCase().includes(filter.toLowerCase())
    
    const matchesFiliere = !filiereFilter || coursItem.filiere_id == filiereFilter
    
    return matchesSearch && matchesFiliere
  })

  const formatDateTime = (dateString) => {
    try {
      const date = parseISO(dateString)
      return format(date, "dd/MM/yyyy 'à' HH:mm", { locale: fr })
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'HH:mm', { locale: fr })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (statut) => {
    const statusConfig = {
      planifie: { class: 'badge-warning', text: 'Planifié' },
      confirme: { class: 'badge-success', text: 'Confirmé' },
      annule: { class: 'badge-danger', text: 'Annulé' }
    }
    
    const config = statusConfig[statut] || statusConfig.planifie
    return <span className={`badge ${config.class}`}>{config.text}</span>
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

  if (loading) {
    return (
      <div className="liste-cours">
        <div className="loading">Chargement des cours...</div>
      </div>
    )
  }

  return (
    <div className="liste-cours">
      <div className="page-header">
        <h1>Liste des cours programmés</h1>
        <div className="header-actions">
          <Link to="/cours/nouveau" className="btn btn-primary">
            ➕ Nouveau cours
          </Link>
          <Link to="/recherche" className="btn btn-secondary">
            🔍 Recherche avancée
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Rechercher par matière, enseignant ou salle..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select
            value={filiereFilter}
            onChange={(e) => setFiliereFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Toutes les filières</option>
            {filieres.map(filiere => (
              <option key={filiere.id} value={filiere.id}>
                {filiere.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-info">
          {filteredCours.length} cours sur {cours.length}
        </div>
      </div>

      {/* Tableau des cours */}
      <div className="table-container">
        <table className="cours-table">
          <thead>
            <tr>
              <th>Matière</th>
              <th>Enseignant</th>
              <th>Salle</th>
              <th>Date et Heure</th>
              <th>Formation</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCours.map(coursItem => (
              <tr key={coursItem.id} className="cours-row">
                <td>
                  <div className="matiere-info">
                    <strong>{coursItem.matiere_nom}</strong>
                    {coursItem.matiere_code && (
                      <small>{coursItem.matiere_code}</small>
                    )}
                  </div>
                </td>
                
                <td>
                  <div className="enseignant-info">
                    {coursItem.enseignant_nom} {coursItem.enseignant_prenom}
                  </div>
                </td>
                
                <td>
                  <div className="salle-info">
                    <strong>{coursItem.salle_nom}</strong>
                  </div>
                </td>
                
                <td>
                  <div className="date-info">
                    <div className="date">{formatDateTime(coursItem.date_debut)}</div>
                    <div className="time">
                      {formatTime(coursItem.date_debut)} - {formatTime(coursItem.date_fin)}
                    </div>
                  </div>
                </td>
                
                <td>
                  <div className="filiere-info">
                    {coursItem.filiere_nom}
                  </div>
                </td>
                
                <td>
                  {getTypeBadge(coursItem.type_seance)}
                </td>
                
                <td>
                  {getStatusBadge(coursItem.statut)}
                </td>
                
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-primary"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCours.length === 0 && (
          <div className="no-data">
            {filter || filiereFilter ? 
              'Aucun cours ne correspond à votre recherche' : 
              'Aucun cours programmé'
            }
          </div>
        )}
      </div>

      {/* Résumé statistique */}
      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-number">{cours.filter(c => c.statut === 'planifie').length}</span>
          <span className="stat-label">Planifiés</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{cours.filter(c => c.statut === 'confirme').length}</span>
          <span className="stat-label">Confirmés</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{cours.filter(c => c.statut === 'annule').length}</span>
          <span className="stat-label">Annulés</span>
        </div>
      </div>
    </div>
  )
}

export default ListeCours