import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './GestionEmplois.css';

const GestionEmplois = () => {
    const [stats, setStats] = useState({
        cours_planifies: 0,
        salles_disponibles: 0,
        enseignants_actifs: 0,
        filieres: 0
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/emploi-temps/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Erreur lors du chargement des stats:', error);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Menu de Gestion</h5>
                        </div>
                        <div className="list-group list-group-flush">
                            <Link to="/creer-cours" className="list-group-item list-group-item-action">
                                <i className="fas fa-plus-circle me-2"></i>Créer un cours
                            </Link>
                            <Link to="/liste-cours" className="list-group-item list-group-item-action">
                                <i className="fas fa-list me-2"></i>Liste des cours
                            </Link>
                            <Link to="/recherche-cours" className="list-group-item list-group-item-action">
                                <i className="fas fa-search me-2"></i>Rechercher un cours
                            </Link>
                            <Link to="/liste-batiments" className="list-group-item list-group-item-action">
                                <i className="fas fa-building me-2"></i>Liste des bâtiments
                            </Link>
                            <Link to="/disponibilite-enseignants" className="list-group-item list-group-item-action">
                                <i className="fas fa-chalkboard-teacher me-2"></i>Disponibilité enseignants
                            </Link>
                            <Link to="/disponibilite-salles" className="list-group-item list-group-item-action">
                                <i className="fas fa-door-open me-2"></i>Disponibilité salles
                            </Link>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-9">
                    <div className="card">
                        <div className="card-header">
                            <h4>Tableau de Bord - Gestion des Emplois du Temps</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="card text-white bg-primary mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">{stats.cours_planifies}</h5>
                                            <p className="card-text">Cours Planifiés</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-white bg-success mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">{stats.salles_disponibles}</h5>
                                            <p className="card-text">Salles Disponibles</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-white bg-warning mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">{stats.enseignants_actifs}</h5>
                                            <p className="card-text">Enseignants Actifs</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="card text-white bg-info mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">{stats.filieres}</h5>
                                            <p className="card-text">Filières</p>
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

export default GestionEmplois;