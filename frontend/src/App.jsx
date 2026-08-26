import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FolderOpen, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardShell from './components/DashboardShell';
import CaseTimeline from './pages/CaseTimeline';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }
  return children;
};

const CaseListView = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await axios.get('/cases');
        setCases(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setCases([]);
        setError(err.response?.data?.detail || 'Unable to load cases from the backend.');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading case dossiers...
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-slate-300 font-medium">No Cases Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          {error || 'No legal cases registered yet. Create a case before uploading evidence.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Active Case Dossiers</h2>
        <span className="text-xs text-slate-400">Total: {cases.length} Cases</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Case ID</th>
              <th className="p-3">Case Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {cases.map((c) => {
              const caseId = c.id;
              return (
                <tr key={caseId} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-cyan-400">{c.case_number}</td>
                  <td className="p-3 font-medium text-white">{c.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {c.status || 'Active'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">
                    {c.created_at?.slice(0, 10) || '2026-08-25'}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      to={`/cases/${caseId}/timeline`}
                      className="text-cyan-400 hover:underline font-medium"
                    >
                      View Timeline
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Role Scoped Dashboards */}
          <Route
            path="/dashboard/officer"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <DashboardShell roleTitle="Investigating Officer Console">
                  <CaseListView />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/prosecutor"
            element={
              <ProtectedRoute allowedRoles={['prosecutor', 'admin']}>
                <DashboardShell roleTitle="Public Prosecutor Portal">
                  <CaseListView />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/forensic_expert"
            element={
              <ProtectedRoute allowedRoles={['forensic_expert', 'admin']}>
                <DashboardShell roleTitle="Forensic Lab Analysis Workspace">
                  <CaseListView />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/judge"
            element={
              <ProtectedRoute allowedRoles={['judge', 'admin']}>
                <DashboardShell roleTitle="Judicial Vault & Review">
                  <CaseListView />
                </DashboardShell>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardShell roleTitle="System Admin & Access Control">
                  <CaseListView />
                </DashboardShell>
              </ProtectedRoute>
            }
          />

          {/* Chain-of-Custody Timeline Route */}
          <Route
            path="/cases/:id/timeline"
            element={
              <ProtectedRoute allowedRoles={['officer', 'prosecutor', 'forensic_expert', 'judge', 'admin']}>
                <CaseTimeline />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
