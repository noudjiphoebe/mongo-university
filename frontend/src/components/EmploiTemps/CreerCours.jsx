import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreerCours = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        matiere_id: '',
        enseignant_id: '',
        salle_id: '',
        filiere_id: '',
        date_debut: '',
        date_fin: '',
        type_seance: 'cours',
        statut: 'planifie'
    });
    const [matieres, setMatieres] = useState([]);
    const [enseignants, setEnseignants] = useState([]);
    const [salles, setSalles] = useState([]);
    const [filieres, setFilieres] = useState([]);
    const [infoSalle, setInfoSalle] = useState(null);
    const [infoEnseignant, setInfoEnseignant] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            const [matRes, ensRes, salRes, filRes] = await Promise.all([
                fetch('http://localhost:5000/api/matieres', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/enseignants', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/salles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('http://localhost:5000/api/filieres', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            setMatieres(await matRes.json());
            setEnseignants(await ensRes.json());
            setSalles(await salRes.json());
            setFilieres(await filRes.json());
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'salle_id' && value) {
            fetchSalleInfo(value);
        }
        if (name === 'enseignant_id' && value) {
            fetchEnseignantInfo(value);
        }
    };

    const fetchSalleInfo = async (salleId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/emploi-temps/salle/info/${salleId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setInfoSalle(data);
        } catch (error) {
            console.error('Erreur lors du chargement des infos salle:', error);
        }
    };

    const fetchEnseignantInfo = async (enseignantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/emploi-temps/enseignant/info/${enseignantId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setInfoEnseignant(data);
        } catch (error) {
            console.error('Erreur lors du chargement des infos enseignant:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/emploi-temps/cours', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Cours créé avec succès!');
                navigate('/liste-cours');
            } else {
                const error = await response.json();
                alert(`Erreur: ${error.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de la création du cours:', error);
            alert('Erreur lors de la création du cours');
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Création d'un Nouveau Cours</h4>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <h5>Informations de Base</h5>
                                        <div className="mb-3">
                                            <label className="form-label">Matière</label>
                                            <select 
                                                className="form-select"
                                                name="matiere_id"
                                                value={formData.matiere_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Choisir une matière</option>
                                                {matieres.map(matiere => (
                                                    <option key={matiere.id} value={matiere.id}>
                                                        {matiere.nom} ({matiere.code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Filière</label>
                                            <select 
                                                className="form-select"
                                                name="filiere_id"
                                                value={formData.filiere_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Choisir une filière</option>
                                                {filieres.map(filiere => (
                                                    <option key={filiere.id} value={filiere.id}>
                                                        {filiere.nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Type de séance</label>
                                            <select 
                                                className="form-select"
                                                name="type_seance"
                                                value={formData.type_seance}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="cours">Cours</option>
                                                <option value="td">TD</option>
                                                <option value="tp">TP</option>
                                                <option value="examen">Examen</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Date et Heure</h5>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Date et heure de début</label>
                                                    <input 
                                                        type="datetime-local"
                                                        className="form-control"
                                                        name="date_debut"
                                                        value={formData.date_debut}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Date et heure de fin</label>
                                                    <input 
                                                        type="datetime-local"
                                                        className="form-control"
                                                        name="date_fin"
                                                        value={formData.date_fin}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <h5>Salle</h5>
                                        <div className="mb-3">
                                            <select 
                                                className="form-select"
                                                name="salle_id"
                                                value={formData.salle_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Choisir une salle</option>
                                                {salles.map(salle => (
                                                    <option key={salle.id} value={salle.id}>
                                                        {salle.nom} - {salle.batiment_nom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {infoSalle && (
                                            <div className="p-2 bg-light rounded">
                                                <small>Capacité: {infoSalle.capacite} places</small><br/>
                                                <small>Bâtiment: {infoSalle.batiment_nom}</small><br/>
                                                <small>Type: {infoSalle.type_salle}</small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <h5>Enseignant</h5>
                                        <div className="mb-3">
                                            <select 
                                                className="form-select"
                                                name="enseignant_id"
                                                value={formData.enseignant_id}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="">Choisir un enseignant</option>
                                                {enseignants.map(ens => (
                                                    <option key={ens.id} value={ens.id}>
                                                        {ens.nom} {ens.prenom}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {infoEnseignant && (
                                            <div className="p-2 bg-light rounded">
                                                <small>Spécialité: {infoEnseignant.specialite}</small><br/>
                                                <small>Grade: {infoEnseignant.grade}</small><br/>
                                                <small>Téléphone: {infoEnseignant.telephone}</small>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <button type="submit" className="btn btn-success me-2">
                                            <i className="fas fa-save me-1"></i>Créer le Cours
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/gestion-emplois')}>
                                            <i className="fas fa-arrow-left me-1"></i>Retour
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreerCours;