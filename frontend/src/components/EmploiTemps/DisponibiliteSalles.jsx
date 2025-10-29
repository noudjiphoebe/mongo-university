import React, { useState, useEffect } from 'react';

const DisponibiliteEnseignants = () => {
    const [enseignants, setEnseignants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState('');

    useEffect(() => {
        fetchEnseignants();
    }, []);

    const fetchEnseignants = async () => {
        try {
            // Données mockées - à remplacer par appel API
            const mockEnseignants = [
                {
                    id: 1,
                    nom: 'DUPONT',
                    prenom: 'Jean',
                    specialite: 'Informatique',
                    grade: 'Professeur',
                    cours_planifies: 8,
                    matieres: 'Algorithmique, Programmation, Base de données',
                    disponibilite: 'disponible'
                },
                {
                    id: 2,
                    nom: 'MARTIN',
                    prenom: 'Marie',
                    specialite: 'Mathématiques',
                    grade: 'Maître de conférences',
                    cours_planifies: 6,
                    matieres: 'Algèbre, Analyse, Statistiques',
                    disponibilite: 'disponible'
                },
                {
                    id: 3,
                    nom: 'BERNARD',
                    prenom: 'Pierre',
                    specialite: 'Physique',
                    grade: 'Professeur',
                    cours_planifies: 12,
                    matieres: 'Mécanique, Électromagnétisme, Thermodynamique',
                    disponibilite: 'limite'
                },
                {
                    id: 4,
                    nom: 'PETIT',
                    prenom: 'Sophie',
                    specialite: 'Chimie',
                    grade: 'Maître de conférences',
                    cours_planifies: 4,
                    matieres: 'Chimie organique, Chimie analytique',
                    disponibilite: 'disponible'
                }
            ];
            setEnseignants(mockEnseignants);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des enseignants:', error);
            setLoading(false);
        }
    };

    const getDisponibiliteBadge = (disponibilite) => {
        switch (disponibilite) {
            case 'disponible': return 'bg-success';
            case 'limite': return 'bg-warning text-dark';
            case 'indisponible': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const getDisponibiliteText = (disponibilite) => {
        switch (disponibilite) {
            case 'disponible': return 'Disponible';
            case 'limite': return 'Charge élevée';
            case 'indisponible': return 'Indisponible';
            default: return 'Inconnu';
        }
    };

    const enseignantsFiltres = enseignants.filter(ens =>
        ens.nom.toLowerCase().includes(filtre.toLowerCase()) ||
        ens.prenom.toLowerCase().includes(filtre.toLowerCase()) ||
        ens.specialite.toLowerCase().includes(filtre.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container">
                <div className="text-center mt-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement des enseignants...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Disponibilité des Enseignants</h4>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    placeholder="Rechercher un enseignant..."
                                    value={filtre}
                                    onChange={(e) => setFiltre(e.target.value)}
                                    style={{ width: '250px' }}
                                />
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Enseignant</th>
                                            <th>Spécialité</th>
                                            <th>Grade</th>
                                            <th>Cours Planifiés</th>
                                            <th>Matières</th>
                                            <th>Disponibilité</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enseignantsFiltres.map(enseignant => (
                                            <tr key={enseignant.id}>
                                                <td>
                                                    <strong>{enseignant.nom} {enseignant.prenom}</strong>
                                                </td>
                                                <td>{enseignant.specialite}</td>
                                                <td>
                                                    <span className="badge bg-info">
                                                        {enseignant.grade}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${
                                                        enseignant.cours_planifies <= 5 ? 'bg-success' :
                                                        enseignant.cours_planifies <= 10 ? 'bg-warning text-dark' : 'bg-danger'
                                                    }`}>
                                                        {enseignant.cours_planifies} cours
                                                    </span>
                                                </td>
                                                <td>
                                                    <small>
                                                        {enseignant.matieres.split(', ').map((matiere, index) => (
                                                            <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                                                {matiere}
                                                            </span>
                                                        ))}
                                                    </small>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getDisponibiliteBadge(enseignant.disponibilite)}`}>
                                                        {getDisponibiliteText(enseignant.disponibilite)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button className="btn btn-outline-primary" title="Voir emploi du temps">
                                                            <i className="fas fa-calendar"></i>
                                                        </button>
                                                        <button className="btn btn-outline-info" title="Contacter">
                                                            <i className="fas fa-envelope"></i>
                                                        </button>
                                                        <button className="btn btn-outline-warning" title="Modifier disponibilité">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {enseignantsFiltres.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center text-muted py-4">
                                                    <i className="fas fa-user-slash fa-2x mb-2"></i>
                                                    <p>Aucun enseignant trouvé</p>
                                                    {filtre && (
                                                        <button 
                                                            className="btn btn-outline-secondary btn-sm"
                                                            onClick={() => setFiltre('')}
                                                        >
                                                            Effacer la recherche
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="row mt-4">
                                <div className="col-md-4">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="text-success">
                                                <i className="fas fa-check-circle me-2"></i>
                                                Disponibles
                                            </h5>
                                            <h3 className="text-success">
                                                {enseignants.filter(e => e.disponibilite === 'disponible').length}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="text-warning">
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                Charge élevée
                                            </h5>
                                            <h3 className="text-warning">
                                                {enseignants.filter(e => e.disponibilite === 'limite').length}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h5 className="text-danger">
                                                <i className="fas fa-times-circle me-2"></i>
                                                Indisponibles
                                            </h5>
                                            <h3 className="text-danger">
                                                {enseignants.filter(e => e.disponibilite === 'indisponible').length}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisponibiliteEnseignants;