import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, FilePlus, LogOut, Search } from 'lucide-react';
import UploadModal from './UploadModal';

export default function DashboardShell({ roleTitle, children }) {
  const { user, logout } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/60 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-400/10 text-cyan-400 rounded-lg border border-cyan-400/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">{roleTitle}</h1>
            <p className="text-xs text-slate-400">
              Role: <span className="text-cyan-400 capitalize">{user?.role?.replace('_', ' ')}</span>
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center relative w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search OCR text, sections, IPC/BNS..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-3">
          {(user?.role === 'officer' || user?.role === 'admin' || user?.role === 'forensic_expert') && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <FilePlus className="w-4 h-4" /> Upload Document
            </button>
          )}

          <button
            onClick={logout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}