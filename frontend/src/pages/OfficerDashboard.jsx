import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  UploadCloud, 
  LogOut, 
  ChevronRight, 
  Fingerprint, 
  Clock, 
  Sparkles, 
  Radio, 
  FileBadge2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UploadModal from '../components/UploadModal';

const INITIAL_CASES = [
  {
    id: 'CASE-2026-001',
    title: 'State of TN vs. Ramesh (FIR #102/26)',
    status: 'Under Investigation',
    created: '2026-08-25',
    evidenceCount: 14,
    aiTamperScore: '0.0% (Clean)',
    hashStatus: 'SHA-256 Verified',
    bsaCertified: true,
  },
  {
    id: 'CASE-2026-002',
    title: 'Financial Fraud Inquiry (FIR #044/26)',
    status: 'Forensic Analysis',
    created: '2026-08-24',
    evidenceCount: 6,
    aiTamperScore: '12.4% (Metadata Anomaly)',
    hashStatus: 'Flagged Review',
    bsaCertified: false,
  },
  {
    id: 'CASE-2026-003',
    title: 'Cyber Heist & Extortion Trace (FIR #089/26)',
    status: 'Court Ready',
    created: '2026-08-22',
    evidenceCount: 32,
    aiTamperScore: '0.0% (Clean)',
    hashStatus: 'SHA-256 Verified',
    bsaCertified: true,
  }
];

export default function OfficerDashboard() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUploadSuccess = (newDocData) => {
    setIsUploadOpen(false);
    // Optional: automatically update case count or trigger reload
    alert("Evidence uploaded and cryptographically hashed under Section 63 BSA!");
  };

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Cyber Ambient Aura */}
      <div className="pointer-events-none fixed -top-24 left-1/2 -z-10 h-96 w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px] animate-pulse" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">Investigating Officer Console</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                Role: <span className="text-cyan-400 font-semibold">Officer</span> • <span className="text-teal-300">Sec. 63 BSA Digital Evidence System</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-80 hidden md:block">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search OCR text, sections, IPC/BNS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none transition focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80"
              />
            </div>
            
            {/* Open Upload Modal Trigger Button */}
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        {/* KPI Intelligence Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Active Dossiers</span>
              <FileText className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">18</span>
              <span className="text-xs font-medium text-emerald-400">+2 new cases</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Hash Integrity Match</span>
              <Fingerprint className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">99.8%</span>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <Radio className="w-3 h-3 animate-pulse" /> Verified Clean
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Sec 63 BSA Certificates</span>
              <FileBadge2 className="h-5 w-5 text-teal-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">52</span>
              <span className="text-xs text-teal-300 font-medium">Court Admissible</span>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-rose-400">
              <span className="text-[11px] font-semibold uppercase tracking-wider">AI Tamper Flags</span>
              <AlertTriangle className="h-5 w-5 text-rose-400 animate-bounce" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-300">1</span>
              <span className="text-xs text-rose-400 font-medium">Metadata Anomaly</span>
            </div>
          </div>
        </section>

        {/* Case Dossiers Table */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-xl shadow-2xl">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Active Case Dossiers</span>
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographically sealed evidence vaults under Bharatiya Sakshya Adhiniyam Section 63.
              </p>
            </div>
            <span className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs text-slate-400">
              Total: <strong className="ml-1.5 text-white">{filteredCases.length} Cases</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-4 font-semibold">Case ID</th>
                  <th className="py-4 px-4 font-semibold">Case Title & FIR</th>
                  <th className="py-4 px-4 font-semibold">Investigation Status</th>
                  <th className="py-4 px-4 font-semibold">AI Tamper & Hash Seal</th>
                  <th className="py-4 px-4 font-semibold">BSA 63 Cert</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="group transition-colors duration-200 hover:bg-slate-800/30">
                    <td className="py-4 px-4 font-mono font-medium text-cyan-400">
                      {c.id}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-200 transition-colors">
                        {c.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3" /> Logged {c.created} • {c.evidenceCount} Sealed Files
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                        c.status === 'Court Ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        {c.hashStatus.includes('Verified') ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-slate-200">{c.hashStatus}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Score: {c.aiTamperScore}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {c.bsaCertified ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-400">
                          <ShieldCheck className="h-3.5 w-3.5" /> Valid Seal
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Pending IO Signature</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/cases/${c.id}/timeline`)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-all duration-200 hover:bg-cyan-500 hover:text-slate-950 active:scale-95 cursor-pointer"
                      >
                        <span>View Timeline</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <UploadModal 
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}