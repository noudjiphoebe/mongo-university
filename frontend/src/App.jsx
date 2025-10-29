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
import Layout from './components/Layout'
import './App.css'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/cours" element={
          <ProtectedRoute>
            <Layout>
              <ListeCours />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/cours/nouveau" element={
          <ProtectedRoute>
            <Layout>
              <CreationCours />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/recherche" element={
          <ProtectedRoute>
            <Layout>
              <RechercheCours />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/batiments" element={
          <ProtectedRoute>
            <Layout>
              <ListeBatiments />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/enseignants/disponibilite" element={
          <ProtectedRoute>
            <Layout>
              <DisponibiliteEnseignants />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/salles/disponibilite" element={
          <ProtectedRoute>
            <Layout>
              <DisponibiliteSalles />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App