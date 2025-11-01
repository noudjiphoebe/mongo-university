import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './CreationCours.css'

function CreationCours() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    matiere_id: '',
    enseignant_id: '',
    salle_id: '',
    filiere_id: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    type_seance: 'cours',
    observations: ''
  })

  const [matieres, setMatieres] = useState([])
  const [enseignants, setEnseignants] = useState([])
  const [salles, setSalles] = useState([])
  const [filieres, setFilieres] = useState([])

  useEffect(() => {
    fetchFormData()
  }, [])

  const fetchFormData = async () => {
    try {
      const [matRes, ensRes, salRes, filRes] = await Promise.all([
        axios.get('/api/matieres'),
        axios.get('/api/enseignants'),
        axios.get('/api/salles'),
        axios.get('/api/filieres')
      ])

      setMatieres(matRes.data)
      setEnseignants(ensRes.data)
      setSalles(salRes.data)
      setFilieres(filRes.data)
    } catch (error) {
      console.error('Erreur chargement données:', error)
      setError('Erreur lors du chargement des données')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Combiner date et heures
      const dateDebut = `${formData.date}T${formData.heure_debut}`
      const dateFin = `${formData.date}T${formData.heure_fin}`

      const coursData = {
        matiere_id: parseInt(formData.matiere_id),
        enseignant_id: parseInt(formData.enseignant_id),
        salle_id: parseInt(formData.salle_id),
        filiere_id: parseInt(formData.filiere_id),
        date_debut: dateDebut,
        date_fin: dateFin,
        type_seance: formData.type_seance,
        observations: formData.observations
      }

      // ⭐⭐ CONSOLE.LOG AJOUTÉS ICI ⭐⭐
      console.log('=== DONNÉES ENVOYÉES VERS BACKEND ===')
      console.log('Données complètes:', coursData)
      console.log('URL de la requête:', '/api/cours')
      console.log('Type de date_debut:', typeof coursData.date_debut, coursData.date_debut)
      console.log('Type de date_fin:', typeof coursData.date_fin, coursData.date_fin)
      console.log('==============================')

      const response = await axios.post('/api/cours', coursData)
      
      // ⭐⭐ CONSOLE.LOG AJOUTÉS ICI ⭐⭐
      console.log('=== RÉPONSE DU BACKEND ===')
      console.log('Réponse:', response.data)
      console.log('===========================')
      
      setSuccess('Cours créé avec succès!')
      
      // Réinitialiser le formulaire
      setFormData({
        matiere_id: '',
        enseignant_id: '',
        salle_id: '',
        filiere_id: '',
        date: '',
        heure_debut: '',
        heure_fin: '',
        type_seance: 'cours',
        observations: ''
      })

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/cours')
      }, 2000)

    } catch (error) {
      // ⭐⭐ CONSOLE.LOG AJOUTÉS ICI ⭐⭐
      console.log('=== ERREUR DÉTAILLÉE ===')
      console.log('Status:', error.response?.status)
      console.log('Message d\'erreur:', error.response?.data)
      console.log('Erreur complète:', error)
      console.log('========================')
      
      setError(error.response?.data?.error || 'Erreur lors de la création du cours')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="creation-cours">
      <div className="page-header">
        <h1>Création d'un nouveau cours</h1>
        <button onClick={() => navigate('/cours')} className="btn btn-secondary">
          ← Retour à la liste
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>Succès:</strong> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="cours-form">
        {/* Section Informations de base */}
        <div className="form-section">
          <h3>📋 Informations de base</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Matière *</label>
              <select
                name="matiere_id"
                value={formData.matiere_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionnez une matière</option>
                {matieres.map(matiere => (
                  <option key={matiere.id} value={matiere.id}>
                    {matiere.nom} ({matiere.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Formation *</label>
              <select
                name="filiere_id"
                value={formData.filiere_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionnez une formation</option>
                {filieres.map(filiere => (
                  <option key={filiere.id} value={filiere.id}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section Planning */}
        <div className="form-section">
          <h3>🕐 Planning</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Heure de début *</label>
              <input
                type="time"
                name="heure_debut"
                value={formData.heure_debut}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Heure de fin *</label>
              <input
                type="time"
                name="heure_fin"
                value={formData.heure_fin}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Section Ressources */}
        <div className="form-section">
          <h3>👨‍🏫 Ressources</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Enseignant *</label>
              <select
                name="enseignant_id"
                value={formData.enseignant_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionnez un enseignant</option>
                {enseignants.map(enseignant => (
                  <option key={enseignant.id} value={enseignant.id}>
                    {enseignant.nom} {enseignant.prenom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Salle *</label>
              <select
                name="salle_id"
                value={formData.salle_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Sélectionnez une salle</option>
                {salles.map(salle => (
                  <option key={salle.id} value={salle.id}>
                    {salle.nom} ({salle.type_salle}) - Capacité: {salle.capacite}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Type de séance</label>
              <select
                name="type_seance"
                value={formData.type_seance}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="cours">Cours</option>
                <option value="td">TD</option>
                <option value="tp">TP</option>
                <option value="examen">Examen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Observations */}
        <div className="form-section">
          <h3>📝 Observations</h3>
          <div className="form-group">
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              placeholder="Notes supplémentaires, matériel requis, informations particulières..."
              rows="4"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary btn-large"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Création en cours...
              </>
            ) : (
              'Créer le cours'
            )}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/cours')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreationCours