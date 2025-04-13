import React from 'react'
import useAuth from './hooks/useAuth'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Import Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashBoardPage from './pages/DashBoardPage'
import ProfilePage from './pages/ProfilePage'
import OpenForumPage from './pages/OpenForumPage'
import ClosedForumPage from './pages/ClosedForumPage'
import ThreadViewPage from './pages/ThreadViewPage'
import SearchPage from './pages/SearchPage'
import AdminPanelPage from './pages/AdminPanelPage'
import NotFoundPage from './pages/NotFoundPage'

// Component containing routes and logic that depends on AuthContext
function AppRoutes() {
  const { isLoggedIn, isAdmin, currentUser, isLoading } = useAuth()

  // Basic Protected Route Component
  const ProtectedRoute = ({ children, adminOnly = false, requiresApproval = true }) => {
    if (isLoading) {
      return <div>Loading...</div> // Or a Spinner component
    }
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />
    }
    if (requiresApproval && !currentUser?.isApproved) {
      // Optional: Redirect to a specific page if not approved
      return <div>Your account is pending approval.</div>
    }
    if (adminOnly && !isAdmin) {
      return <Navigate to="/dashboard" replace /> // Or an unauthorized page
    }
    return children
  }

  // Basic Public Route Component (for Login/Register when logged in)
  const PublicRoute = ({ children }) => {
    if (isLoading) {
      return <div>Loading...</div> // Or a Spinner component
    }
    if (isLoggedIn) {
      return <Navigate to="/dashboard" replace />
    }
    return children
  }

  if (isLoading) {
    // Display loading state while checking auth. AuthProvider ensures this hook runs only after context is potentially available
    return <div>Loading application...</div> 
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected Routes (require login + approval) */}
      <Route path="/dashboard" element={<ProtectedRoute><DashBoardPage /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/forum/open" element={<ProtectedRoute><OpenForumPage /></ProtectedRoute>} />
      <Route path="/forum/thread/:threadId" element={<ProtectedRoute><ThreadViewPage /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

      {/* Admin Routes (require login + approval + admin role) */}
      <Route
        path="/admin"
        element={<ProtectedRoute adminOnly={true}><AdminPanelPage /></ProtectedRoute>}
      />
      <Route
        path="/forum/closed"
        element={<ProtectedRoute adminOnly={true}><ClosedForumPage /></ProtectedRoute>}
      />

      {/* Redirect root path - logic now relies on hook called within AuthProvider */}
      <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// Main App component now just sets up the Provider
function App() {
  return (
    <AuthProvider>
      <AppRoutes /> { /* Routes component is now a child of AuthProvider */ }
    </AuthProvider>
  );
}

export default App
