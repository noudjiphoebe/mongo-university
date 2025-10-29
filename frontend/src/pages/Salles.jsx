import React, { useState, useEffect } from 'react';
import { salleService } from '../services/api';

const Salles = () => {
  const [salles, setSalles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalles = async () => {
      try {
        const sallesData = await salleService.getSalles();
        setSalles(sallesData);
      } catch (error) {
        console.error('Error fetching salles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalles();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des salles...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>🏫 Gestion des Salles</h1>
      
      <div className="grid">
        {salles.map(salle => (
          <div key={salle.id} className="card">
            <h3>{salle.nom}</h3>
            <p><strong>Capacité:</strong> {salle.capacite} places</p>
            <p><strong>Type:</strong> {salle.type_salle}</p>
            <p><strong>Bâtiment:</strong> {salle.batiment_nom}</p>
            <p><strong>Étage:</strong> {salle.etage}</p>
            <p><strong>Équipements:</strong> {salle.equipements}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Salles;
