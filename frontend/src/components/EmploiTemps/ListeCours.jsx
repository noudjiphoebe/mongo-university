import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ListeCours = () => {
    const [cours, setCours] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCours();
    }, []);

    const fetchCours = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/emploi-temps/cours', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setCours(data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des cours:', error);
            setLoading(false);
        }
    };

    const getBadgeClass = (statut) => {
        switch (statut) {
            case 'planifie': return 'bg-warning';
            case 'confirme': return 'bg-success';
            case 'annule': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    if (loading) {
        return <div className="text-center mt-4">Chargement...</div>;
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Liste des Cours</h4>
                            <Link to="/creer-cours" className="btn btn-light btn-sm">
                                <i className="fas fa-plus me-1"></i>Nouveau Cours
                            </Link>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Matière</th>
                                            <th>Enseignant</th>
                                            <th>Salle</th>
                                            <th>Date Début</th>
                                            <th>Date Fin</th>
                                            <th>Type</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cours.map(cour => (
                                            <tr key={cour.id}>
                                                <td>
                                                    <strong>{cour.matiere_nom}</strong>
                                                    <br/>
                                                    <small className="text-muted">{cour.matiere_code}</small>
                                                </td>
                                                <td>{cour.enseignant_nom} {cour.enseignant_prenom}</td>
                                                <td>
                                                    {cour.salle_nom}
                                                    <br/>
                                                    <small className="text-muted">{cour.batiment_nom}</small>
                                                </td>
                                                <td>{new Date(cour.date_debut).toLocaleString('fr-FR')}</td>
                                                <td>{new Date(cour.date_fin).toLocaleString('fr-FR')}</td>
                                                <td>
                                                    <span className="badge bg-info text-uppercase">
                                                        {cour.type_seance}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getBadgeClass(cour.statut)}`}>
                                                        {cour.statut}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button className="btn btn-outline-primary" title="Voir">
                                                            <i className="fas fa-eye"></i>
                                                        </button>
                                                        <button className="btn btn-outline-warning" title="Modifier">
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button className="btn btn-outline-danger" title="Supprimer">
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {cours.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="text-center text-muted py-4">
                                                    <i className="fas fa-inbox fa-2x mb-2"></i>
                                                    <p>Aucun cours trouvé</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeCours;