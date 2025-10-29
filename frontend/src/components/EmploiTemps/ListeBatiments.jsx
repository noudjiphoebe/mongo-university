import React, { useState, useEffect } from 'react';

const ListeBatiments = () => {
    const [batiments, setBatiments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBatiments();
    }, []);

    const fetchBatiments = async () => {
        try {
            // Données mockées - à remplacer par appel API
            const mockBatiments = [
                {
                    id: 1,
                    nom: 'Bâtiment Principal',
                    adresse: 'Campus Universitaire, Avenue de la Science',
                    nombre_salles: 5,
                    salles: 'Amphi A, Salle 101, Salle 102, Labo Info, Salle 103'
                },
                {
                    id: 2,
                    nom: 'Bâtiment des Sciences',
                    adresse: 'Campus Universitaire, Rue des Chercheurs',
                    nombre_salles: 3,
                    salles: 'Amphi B, Salle 201, Labo Physique'
                },
                {
                    id: 3,
                    nom: 'Bâtiment des Lettres',
                    adresse: 'Campus Universitaire, Boulevard des Arts',
                    nombre_salles: 4,
                    salles: 'Salle 301, Salle 302, Salle 303, Salle 304'
                }
            ];
            setBatiments(mockBatiments);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des bâtiments:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="text-center mt-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement des bâtiments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Liste des Bâtiments</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                {batiments.map(batiment => (
                                    <div key={batiment.id} className="col-md-6 col-lg-4 mb-4">
                                        <div className="card h-100">
                                            <div className="card-header bg-light">
                                                <h5 className="card-title mb-0">
                                                    <i className="fas fa-building me-2 text-primary"></i>
                                                    {batiment.nom}
                                                </h5>
                                            </div>
                                            <div className="card-body">
                                                <p className="card-text">
                                                    <small className="text-muted">
                                                        <i className="fas fa-map-marker-alt me-1"></i>
                                                        {batiment.adresse}
                                                    </small>
                                                </p>
                                                
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="badge bg-primary">
                                                        {batiment.nombre_salles} salle(s)
                                                    </span>
                                                </div>

                                                <h6 className="mt-3 mb-2">
                                                    <i className="fas fa-door-open me-1"></i>
                                                    Salles :
                                                </h6>
                                                <div className="salles-list">
                                                    {batiment.salles.split(', ').map((salle, index) => (
                                                        <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                                            {salle}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="card-footer bg-transparent">
                                                <div className="btn-group w-100">
                                                    <button className="btn btn-outline-primary btn-sm">
                                                        <i className="fas fa-eye me-1"></i>Voir
                                                    </button>
                                                    <button className="btn btn-outline-warning btn-sm">
                                                        <i className="fas fa-edit me-1"></i>Modifier
                                                    </button>
                                                    <button className="btn btn-outline-info btn-sm">
                                                        <i className="fas fa-calendar me-1"></i>Emploi du temps
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {batiments.length === 0 && (
                                <div className="text-center text-muted py-5">
                                    <i className="fas fa-building fa-3x mb-3"></i>
                                    <p>Aucun bâtiment trouvé</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListeBatiments;