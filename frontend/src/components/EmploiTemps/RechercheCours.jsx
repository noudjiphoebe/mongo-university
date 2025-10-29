import React, { useState } from 'react';

const RechercheCours = () => {
    const [formData, setFormData] = useState({
        matiere: '',
        enseignant: '',
        salle: '',
        filiere: '',
        date_debut: '',
        date_fin: '',
        type_seance: '',
        statut: ''
    });
    const [resultats, setResultats] = useState([]);
    const [rechercheEffectuee, setRechercheEffectuee] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            
            Object.entries(formData).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`http://localhost:5000/api/emploi-temps/cours/recherche?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setResultats(data);
            setRechercheEffectuee(true);
        } catch (error) {
            console.error('Erreur lors de la recherche:', error);
        }
    };

    const getBadgeClass = (statut) => {
        switch (statut) {
            case 'planifie': return 'bg-warning';
            case 'confirme': return 'bg-success';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Critères de Recherche</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Matière</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        name="matiere"
                                        value={formData.matiere}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Enseignant</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        name="enseignant"
                                        value={formData.enseignant}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Salle</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        name="salle"
                                        value={formData.salle}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Filière</label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        name="filiere"
                                        value={formData.filiere}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Date début</label>
                                        <input 
                                            type="date"
                                            className="form-control"
                                            name="date_debut"
                                            value={formData.date_debut}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Date fin</label>
                                        <input 
                                            type="date"
                                            className="form-control"
                                            name="date_fin"
                                            value={formData.date_fin}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Type séance</label>
                                    <select 
                                        className="form-select"
                                        name="type_seance"
                                        value={formData.type_seance}
                                        onChange={handleChange}
                                    >
                                        <option value="">Tous les types</option>
                                        <option value="cours">Cours</option>
                                        <option value="td">TD</option>
                                        <option value="tp">TP</option>
                                        <option value="examen">Examen</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Statut</label>
                                    <select 
                                        className="form-select"
                                        name="statut"
                                        value={formData.statut}
                                        onChange={handleChange}
                                    >
                                        <option value="">Tous les statuts</option>
                                        <option value="planifie">Planifié</option>
                                        <option value="confirme">Confirmé</option>
                                        <option value="annule">Annulé</option>
                                    </select>
                                </div>
                                
                                <button type="submit" className="btn btn-primary w-100">
                                    <i className="fas fa-search me-1"></i>Rechercher
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Résultats de la Recherche</h5>
                        </div>
                        <div className="card-body">
                            {rechercheEffectuee ? (
                                resultats.length > 0 ? (
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Matière</th>
                                                    <th>Enseignant</th>
                                                    <th>Salle</th>
                                                    <th>Date</th>
                                                    <th>Heure</th>
                                                    <th>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resultats.map(resultat => (
                                                    <tr key={resultat.id}>
                                                        <td>{resultat.matiere_nom}</td>
                                                        <td>{resultat.enseignant_nom}</td>
                                                        <td>{resultat.salle_nom}</td>
                                                        <td>{new Date(resultat.date_debut).toLocaleDateString('fr-FR')}</td>
                                                        <td>
                                                            {new Date(resultat.date_debut).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - {' '}
                                                            {new Date(resultat.date_fin).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${getBadgeClass(resultat.statut)}`}>
                                                                {resultat.statut}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        <i className="fas fa-search fa-3x mb-3"></i>
                                        <p>Aucun résultat trouvé pour votre recherche</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-search fa-3x mb-3"></i>
                                    <p>Veuillez saisir des critères de recherche</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RechercheCours;