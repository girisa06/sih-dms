npimport React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  User, 
  ShieldCheck, 
  Share2, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Lock,
  ArrowLeft
} from 'lucide-react';

// --- FALLBACK MOCK DATA ---
// Aligned with the 'cases' and 'audit_log' schema specifications
const MOCK_CASE_DATA = {
  id: "c101",
  case_number: "FIR-2026-0892",
  title: "State vs. Cyber Breach Logistics Ltd.",
  created_by: "Insp. Rajesh Kumar (ID: OFF-4022)",
  status: "UNDER_INVESTIGATION", // Enum: OPEN, UNDER_INVESTIGATION, FILED, CLOSED
  created_at: "2026-08-20T10:30:00Z",
  description: "Investigation into unauthorized system access, data exfiltration, and potential insider tampering with secure logs.",
  
  // Timeline events representing audit logs and case milestones
  timeline: [
    {
      id: "evt-1",
      date: "2026-08-20T10:30:00Z",
      title: "First Information Report (FIR) Registered",
      actor: "Insp. Rajesh Kumar",
      type: "CREATION",
      hash: "a3f89e1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
      description: "FIR registered under section 66 (IT Act). Initial document set attached."
    },
    {
      id: "evt-2",
      date: "2026-08-21T14:15:00Z",
      title: "Forensic Evidence Uploaded",
      actor: "Dr. A. Sharma (Forensic Expert)",
      type: "EVIDENCE",
      hash: "b4e90f2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
      description: "Memory dump and disk image forensic reports uploaded with SHA-256 envelope encryption."
    },
    {
      id: "evt-3",
      date: "2026-08-23T09:45:00Z",
      title: "Time-Bound Access Granted",
      actor: "Insp. Rajesh Kumar",
      type: "ACCESS",
      hash: "c5f01a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
      description: "Granted temporary read-only access to Public Prosecutor (Expires 2026-09-01)."
    },
    {
      id: "evt-4",
      date: "2026-08-25T16:00:00Z",
      title: "Draft Chargesheet Attached",
      actor: "Adv. Meera Nair (Prosecutor)",
      type: "FILING",
      hash: "d6a12b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
      description: "Preliminary chargesheet reviewed and queued for digital signing."
    }
  ]
};

export default function CaseDetailLayout({ caseId = "c101" }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    async function fetchCaseDetails() {
      setLoading(true);
      try {
        // Attempting connection to Person 1's backend endpoint
        const response = await fetch(`/cases/${caseId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCaseData(data);
        setIsUsingMock(false);
      } catch (err) {
        console.warn("Backend unavailable. Falling back to Mock Data for development.", err);
        // Fallback to mock data state
        setCaseData(MOCK_CASE_DATA);
        setIsUsingMock(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex items-center space-x-3 text-slate-600">
          <Clock className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Loading case file...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Top Banner for Mock Data Notification */}
      {isUsingMock && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center gap-2 shadow-inner">
          <AlertCircle className="w-4 h-4" />
          <span>Backend endpoints unreachable. Running in Mock Data Fallback Mode.</span>
        </div>
      )}

      {/* Navigation Header */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-1 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold tracking-wider uppercase text-slate-400">
            Case Details & Audit Trail[cite: 1]
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> BSA Section 63 Compliant[cite: 1]
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* --- MAIN HEADER METADATA BLOCK --- */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                  {caseData.case_number}
                </span>
                <StatusBadge status={caseData.status} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{caseData.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-slate-500" /> Share Access
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> Add Document
              </button>
            </div>
          </div>

          <p className="text-slate-600 text-sm mt-3 border-t border-slate-100 pt-3">
            {caseData.description}
          </p>

          {/* Key Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center text-slate-600">
              <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>Created By: <strong className="text-slate-800">{caseData.created_by}</strong></span>
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>Created Date: <strong className="text-slate-800">{new Date(caseData.created_at).toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center text-slate-600">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>Case ID: <strong className="font-mono text-slate-800">{caseData.id}</strong></span>
            </div>
          </div>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="border-b border-slate-200 mb-6 flex space-x-8">
          {[
            { id: 'timeline', label: 'Audit Timeline', icon: History },
            { id: 'documents', label: 'Documents & Evidence', icon: FileText },
            { id: 'custody', label: 'Chain of Custody', icon: ShieldCheck },
            { id: 'sharing', label: 'Access & Sharing', icon: Share2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT AREA --- */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" /> Case Activity & Event Timeline
            </h2>

            {/* Dynamic Vertical Timeline Component */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-4 ml-2">
              {caseData.timeline && caseData.timeline.length > 0 ? (
                caseData.timeline.map((event) => (
                  <TimelineEventItem key={event.id} event={event} />
                ))
              ) : (
                <div className="text-slate-500 text-sm py-4">No events logged for this case yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Placeholder States for remaining features */}
        {activeTab === 'documents' && <PlaceholderTab title="Documents & Evidence List" icon={FileText} />}
        {activeTab === 'custody' && <PlaceholderTab title="Hash-Chain & Chain of Custody Ledger" icon={ShieldCheck} />}
        {activeTab === 'sharing' && <PlaceholderTab title="Time-Bound Sharing Settings" icon={Share2} />}

      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function TimelineEventItem({ event }) {
  return (
    <div className="relative group">
      {/* Timeline Node Marker */}
      <div className="absolute -left-[31px] sm:-left-[39px] top-0 bg-white p-1 rounded-full border-2 border-blue-600 text-blue-600 shadow-sm">
        <CheckCircle2 className="w-4 h-4 fill-blue-50" />
      </div>

      {/* Event Card */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <h3 className="text-base font-semibold text-slate-900">{event.title}</h3>
          <time className="text-xs text-slate-500 font-mono">
            {new Date(event.date).toLocaleString()}
          </time>
        </div>

        <p className="text-xs text-slate-600 mb-3">{event.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Actor: <strong className="text-slate-700">{event.actor}</strong>
          </span>
          <div className="font-mono text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded truncate max-w-xs" title={`Hash: ${event.hash}`}>
            Hash: {event.hash.substring(0, 16)}...
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    OPEN: "bg-blue-50 text-blue-700 border-blue-200",
    UNDER_INVESTIGATION: "bg-amber-50 text-amber-700 border-amber-200",
    FILED: "bg-purple-50 text-purple-700 border-purple-200",
    CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.OPEN}`}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
}

function PlaceholderTab({ title, icon: Icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-md mx-auto">
        This view is scheduled to be connected to backend APIs during subsequent integration checkpoints[cite: 1].
      </p>
    </div>
  );
}