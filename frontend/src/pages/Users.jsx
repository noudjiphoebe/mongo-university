import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await userService.getUsers();
        setUsers(usersData);
      } catch (error) {
        setError('Erreur lors du chargement des utilisateurs');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des utilisateurs...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0' }}>👥 Gestion des Utilisateurs</h1>
      
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #667eea' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Nom</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Rôle</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Date création</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{user.id}</td>
                <td style={{ padding: '1rem' }}>{user.prenom} {user.nom}</td>
                <td style={{ padding: '1rem' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    background: user.role === 'admin' ? '#e74c3c' : '#3498db',
                    color: 'white'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
