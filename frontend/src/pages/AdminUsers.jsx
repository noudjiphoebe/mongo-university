import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const [formData, setFormData] = useState({  // ← CORRECTION: Ajout du = ici
        nom: '',
        prenom: '',
        email: '',
        role: 'etudiant',
        telephone: '',
        filiere_id: ''
    });

    const [filieres, setFilieres] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchFilieres();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/utilisateurs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
            setError('Erreur lors du chargement des utilisateurs');
            setLoading(false);
        }
    };

    const fetchFilieres = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/api/filieres', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFilieres(response.data);
        } catch (error) {
            console.error('Erreur chargement filières:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            if (editingUser) {
                // Modification
                await axios.put(`http://localhost:3000/api/utilisateurs/${editingUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Utilisateur modifié avec succès!');
            } else {
                // Création
                await axios.post('http://localhost:3000/api/utilisateurs', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Utilisateur créé avec succès!');
            }
            
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'opération');
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:3000/api/utilisateurs/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Utilisateur supprimé avec succès!');
                fetchUsers();
            } catch (error) {
                console.error('Erreur suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nom: '',
            prenom: '',
            email: '',
            role: 'etudiant',
            telephone: '',
            filiere_id: ''
        });
        setEditingUser(null);
        setShowAddForm(false);
    };

    const startEdit = (user) => {
        setFormData({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            telephone: user.telephone || '',
            filiere_id: user.filiere_id || ''
        });
        setEditingUser(user);
        setShowAddForm(true);
    };

    const getRoleBadge = (role) => {
        const roles = {
            admin: 'danger',
            enseignant: 'warning',
            etudiant: 'success'
        };
        return <span className={`badge bg-${roles[role]}`}>{role}</span>;
    };

    if (loading) return <div className="text-center mt-5">Chargement...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">👥 Gestion des Utilisateurs</h4>
                            <button 
                                className="btn btn-light btn-sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                            >
                                {showAddForm ? '❌ Annuler' : '➕ Ajouter Utilisateur'}
                            </button>
                        </div>

                        {/* Formulaire d'ajout/modification */}
                        {showAddForm && (
                            <div className="card-body border-bottom">
                                <h5>{editingUser ? 'Modifier' : 'Ajouter'} un Utilisateur</h5>
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Nom</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.nom}
                                                    onChange={(e) => setFormData({...formData, nom: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Prénom</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.prenom}
                                                    onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Rôle</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                    required
                                                >
                                                    <option value="etudiant">Étudiant</option>
                                                    <option value="enseignant">Enseignant</option>
                                                    <option value="admin">Administrateur</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Téléphone</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    value={formData.telephone}
                                                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                                                />
                                            </div>
                                            {formData.role === 'etudiant' && (
                                                <div className="mb-3">
                                                    <label className="form-label">Filière</label>
                                                    <select
                                                        className="form-select"
                                                        value={formData.filiere_id}
                                                        onChange={(e) => setFormData({...formData, filiere_id: e.target.value})}
                                                    >
                                                        <option value="">Choisir une filière</option>
                                                        {filieres.map(filiere => (
                                                            <option key={filiere.id} value={filiere.id}>
                                                                {filiere.nom}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button type="submit" className="btn btn-success">
                                            {editingUser ? '💾 Modifier' : '➕ Créer'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                                            ❌ Annuler
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Tableau des utilisateurs */}
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Nom & Prénom</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                            <th>Téléphone</th>
                                            <th>Filière</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.nom} {user.prenom}</td>
                                                <td>{user.email}</td>
                                                <td>{getRoleBadge(user.role)}</td>
                                                <td>{user.telephone || '-'}</td>
                                                <td>{user.filiere_nom || '-'}</td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button 
                                                            className="btn btn-outline-primary"
                                                            onClick={() => startEdit(user)}
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button 
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleDelete(user.id)}
                                                            disabled={user.role === 'admin'}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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

export default AdminUsers;