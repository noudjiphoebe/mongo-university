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
  const [editingCourse, setEditingCourse] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchCours()
    fetchFilieres()
  }, [])

  const fetchCours = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
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

  // Fonction pour supprimer un cours
  const deleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le cours "${courseName}" ? Cette action est irréversible.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Mettre à jour l'état local
      setCours(cours.filter(course => course.id !== courseId))
      alert('Cours supprimé avec succès')
    } catch (error) {
      console.error('Erreur suppression cours:', error)
      alert('Erreur lors de la suppression du cours')
    }
  }

  // Fonction pour ouvrir le modal de modification
  const openEditModal = (course) => {
    setEditingCourse(course)
    setFormData({
      date_debut: format(parseISO(course.date_debut), "yyyy-MM-dd'T'HH:mm"),
      date_fin: format(parseISO(course.date_fin), "yyyy-MM-dd'T'HH:mm"),
      salle_id: course.salle_id,
      type_seance: course.type_seance
    })
    setShowEditModal(true)
  }

  // Fonction pour fermer le modal
  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingCourse(null)
    setFormData({})
  }

  // Fonction pour sauvegarder les modifications
  const saveCourse = async () => {
    if (!editingCourse) return

    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/courses/${editingCourse.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Mettre à jour l'état local
      setCours(cours.map(course => 
        course.id === editingCourse.id 
          ? { 
              ...course, 
              date_debut: formData.date_debut,
              date_fin: formData.date_fin,
              salle_id: formData.salle_id,
              type_seance: formData.type_seance
            }
          : course
      ))

      closeEditModal()
      alert('Cours modifié avec succès')
    } catch (error) {
      console.error('Erreur modification cours:', error)
      alert('Erreur lors de la modification du cours')
    }
  }

  // Fonction pour annuler un cours
  const cancelCourse = async (courseId, courseName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler le cours "${courseName}" ?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/cours/${courseId}`, {
        statut: 'annule',
        motif_annulation: 'Annulé par l\'administrateur'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Mettre à jour l'état local
      setCours(cours.map(course => 
        course.id === courseId 
          ? { ...course, statut: 'annule' }
          : course
      ))

      alert('Cours annulé avec succès')
    } catch (error) {
      console.error('Erreur annulation cours:', error)
      alert('Erreur lors de l\'annulation du cours')
    }
  }

  // Fonction pour confirmer un cours
  const confirmCourse = async (courseId, courseName) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/cours/${courseId}`, {
        statut: 'confirme'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // Mettre à jour l'état local
      setCours(cours.map(course => 
        course.id === courseId 
          ? { ...course, statut: 'confirme' }
          : course
      ))

      alert('Cours confirmé avec succès')
    } catch (error) {
      console.error('Erreur confirmation cours:', error)
      alert('Erreur lors de la confirmation du cours')
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
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Chargement des cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="liste-cours">
      <div className="page-header">
        <h1>📚 Liste des cours programmés</h1>
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
            placeholder="🔍 Rechercher par matière, enseignant ou salle..."
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
            <option value="">🎓 Toutes les filières</option>
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
                    {/* Bouton Modifier */}
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => openEditModal(coursItem)}
                      title="Modifier le cours"
                    >
                      ✏️
                    </button>

                    {/* Bouton Confirmer/Annuler selon le statut */}
                    {coursItem.statut === 'planifie' && (
                      <button 
                        className="btn-action btn-confirm"
                        onClick={() => confirmCourse(coursItem.id, coursItem.matiere_nom)}
                        title="Confirmer le cours"
                      >
                        ✅
                      </button>
                    )}

                    {coursItem.statut !== 'annule' && (
                      <button 
                        className="btn-action btn-cancel"
                        onClick={() => cancelCourse(coursItem.id, coursItem.matiere_nom)}
                        title="Annuler le cours"
                      >
                        ⏸️
                      </button>
                    )}

                    {/* Bouton Supprimer */}
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => deleteCourse(coursItem.id, coursItem.matiere_nom)}
                      title="Supprimer définitivement"
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

      {/* Modal de modification */}
      {showEditModal && editingCourse && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ Modifier le cours</h2>
              <button className="modal-close" onClick={closeEditModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Matière:</label>
                <input 
                  type="text" 
                  value={editingCourse.matiere_nom} 
                  disabled 
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Date et heure de début:</label>
                <input 
                  type="datetime-local" 
                  value={formData.date_debut}
                  onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Date et heure de fin:</label>
                <input 
                  type="datetime-local" 
                  value={formData.date_fin}
                  onChange={(e) => setFormData({...formData, date_fin: e.target.value})}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Type de séance:</label>
                <select 
                  value={formData.type_seance}
                  onChange={(e) => setFormData({...formData, type_seance: e.target.value})}
                  className="form-control"
                >
                  <option value="cours">Cours</option>
                  <option value="td">TD</option>
                  <option value="tp">TP</option>
                  <option value="examen">Examen</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeEditModal}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={saveCourse}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListeCours