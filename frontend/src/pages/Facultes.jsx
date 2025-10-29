import React, { useState, useEffect } from 'react';
import { faculteService } from '../services/api';

const Facultes = () => {
  const [facultes, setFacultes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultes = async () => {
      try {
        const facultesData = await faculteService.getFacultes();
        setFacultes(facultesData);
      } catch (error) {
        console.error('Error fetching facultes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultes();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des facultés...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>🏛️ Gestion des Facultés</h1>
      
      <div className="grid">
        {facultes.map(faculte => (
          <div key={faculte.id} className="card">
            <h3>{faculte.nom}</h3>
            <p>{faculte.description}</p>
            <p><strong>Départements:</strong> {faculte.nb_departements || 0}</p>
            <p><strong>Créée le:</strong> {new Date(faculte.date_creation).toLocaleDateString('fr-FR')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Facultes;
