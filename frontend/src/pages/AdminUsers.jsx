import React from 'react'

function AdminUsers() {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>👥 Gestion des Utilisateurs</h1>
        <p>Gérez les comptes utilisateurs et leurs permissions</p>
      </div>
      
      <div className="admin-content">
        <div className="card">
          <h3>Liste des utilisateurs</h3>
          <p>Interface de gestion des utilisateurs à développer...</p>
          {/* Vous pourrez ajouter ici :
              - Tableau des utilisateurs
              - Fonctions de modification/suppression
              - Gestion des rôles
          */}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers