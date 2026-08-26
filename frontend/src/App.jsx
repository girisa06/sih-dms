import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import OfficerDashboard from './pages/OfficerDashboard';
import CaseTimeline from './pages/CaseTimeline';

// ProtectedRoute ensures a user is logged in and has the right role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  // If not logged in, send to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role is restricted and user doesn't have it, redirect them to their specific dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  // Auth looks good, render the dashboard component
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Unprotected Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Officer Console */}
          <Route
            path="/dashboard/officer"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Case Timeline (The animated sci-fi page) */}
          <Route
            path="/cases/:id/timeline"
            element={
              <ProtectedRoute allowedRoles={['officer', 'prosecutor', 'forensic_expert', 'judge', 'admin']}>
                <CaseTimeline />
              </ProtectedRoute>
            }
          />

          {/* Role-Based Redirects (If a user tries to access just /dashboard) */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/officer" replace />} />
          
          {/* Default Fallback (Redirect everything else to login) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}