import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EtudiantDashboard = () => {
  const [emploiDuTemps, setEmploiDuTemps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmploiDuTemps = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/emploi-du-temps/etudiant');
        setEmploiDuTemps(response.data);
      } catch (error) {
        console.error('Erreur chargement emploi du temps:', error);
        // Données mock en attendant
        setEmploiDuTemps([
          { id: 1, cours: 'Mathématiques', enseignant: 'Dr. Dupont', jour: 'Lundi', heure: '08:00-10:00', salle: 'A101' },
          { id: 2, cours: 'Histoire', enseignant: 'Prof. Martin', jour: 'Mardi', heure: '14:00-16:00', salle: 'C301' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmploiDuTemps();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Espace Étudiant</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Mon Emploi du Temps</h2>
        
        {emploiDuTemps.length === 0 ? (
          <p>Aucun cours planifié</p>
        ) : (
          <div className="grid gap-4">
            {emploiDuTemps.map((cours) => (
              <div key={cours.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{cours.cours}</h3>
                <p>Enseignant: {cours.enseignant}</p>
                <p>{cours.jour} - {cours.heure}</p>
                <p>Salle: {cours.salle}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EtudiantDashboard;