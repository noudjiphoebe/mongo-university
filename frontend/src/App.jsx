import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ListeCours from './pages/ListeCours'
import CreationCours from './pages/CreationCours'
import RechercheCours from './pages/RechercheCours'
import ListeBatiments from './pages/ListeBatiments'
import DisponibiliteEnseignants from './pages/DisponibiliteEnseignants'
import DisponibiliteSalles from './pages/DisponibiliteSalles'
import AdminDashboard from './pages/AdminDashboard'
import EnseignantDashboard from './pages/EnseignantDashboard'
import EtudiantDashboard from './pages/EtudiantDashboard'
import Unauthorized from './pages/Unauthorized'
import AdminUsers from './pages/AdminUsers'
import AdminStats from './pages/AdminStats'
import Layout from './components/Layout'
import './App.css'

// Protection basique (connexion requise)
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// Protection par rôle hiérarchique
function RoleProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  // Vérification hiérarchique des rôles
  const roleHierarchy = {
    'etudiant': ['etudiant'],
    'enseignant': ['etudiant', 'enseignant'],
    'admin': ['etudiant', 'enseignant', 'admin']
  }
  
  const userAllowedRoles = roleHierarchy[user.role] || []
  const hasAccess = allowedRoles.some(role => userAllowedRoles.includes(role))
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" />
  }
  
  return children
}

// Composant pour rediriger vers le dashboard selon le rôle
function NavigateToRoleDashboard() {
  const { user } = useAuth()
  
  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin" />
    case 'enseignant':
      return <Navigate to="/enseignant" />
    case 'etudiant':
      return <Navigate to="/etudiant" />
    default:
      return <Navigate to="/login" />
  }
}

// COMPOSANT SEPARÉ POUR LES ROUTES ADMIN
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="utilisateurs" element={<AdminUsers />} />
      <Route path="statistiques" element={<AdminStats />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Tableau de bord admin avec sous-routes - CORRIGÉ */}
        <Route path="/admin/*" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminRoutes />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        {/* Les autres routes restent inchangées */}
        <Route path="/enseignant/*" element={
          <RoleProtectedRoute allowedRoles={['enseignant', 'admin']}>
            <Layout>
              <EnseignantDashboard />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        <Route path="/etudiant/*" element={
          <RoleProtectedRoute allowedRoles={['etudiant', 'enseignant', 'admin']}>
            <Layout>
              <EtudiantDashboard />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        {/* Routes existantes avec protection par rôle */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/cours" element={
          <RoleProtectedRoute allowedRoles={['etudiant', 'enseignant', 'admin']}>
            <Layout>
              <ListeCours />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        <Route path="/cours/nouveau" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <CreationCours />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        <Route path="/recherche" element={
          <RoleProtectedRoute allowedRoles={['enseignant', 'admin']}>
            <Layout>
              <RechercheCours />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        <Route path="/batiments" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <ListeBatiments />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        <Route path="/enseignants/disponibilite" element={
          <RoleProtectedRoute allowedRoles={['enseignant', 'admin']}>
            <Layout>
              <DisponibiliteEnseignants />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        <Route path="/salles/disponibilite" element={
          <RoleProtectedRoute allowedRoles={['enseignant', 'admin']}>
            <Layout>
              <DisponibiliteSalles />
            </Layout>
          </RoleProtectedRoute>
        } />
        
        {/* SEULE ROUTE "/" pour la redirection */}
        <Route path="/" element={
          <ProtectedRoute>
            <NavigateToRoleDashboard />
          </ProtectedRoute>
        } />
        
        {/* Route de fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  )
}

export default App