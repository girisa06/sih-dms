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

const API_BASE_URL = "https://sih-dms.onrender.com";

export default function CaseDetailLayout({ caseId = "c101" }) {
  const [caseData, setCaseData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    async function fetchCaseAndAuditData() {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Fetch Case Details from Person 1's Backend
        const caseRes = await fetch(`${API_BASE_URL}/cases/${caseId}`);
        if (!caseRes.ok) {
          throw new Error(`Failed to load case details (Status ${caseRes.status})`);
        }
        const data = await caseRes.json();
        setCaseData(data);

        // Step 2: Extract documents and fetch live audit logs from Person 2's API
        const documents = data.documents || [];
        if (documents.length > 0) {
          const auditPromises = documents.map(doc =>
            fetch(`${API_BASE_URL}/documents/${doc.id || doc._id}/audit-log`)
              .then(res => (res.ok ? res.json() : []))
              .then(logs =>
                logs.map(log => ({
                  id: log.event_hash || Math.random().toString(),
                  date: log.timestamp,
                  title: `${log.action} - ${doc.title || doc.file_name || 'Document'}`,
                  actor: log.actor || 'System',
                  hash: log.event_hash || 'N/A',
                  description: `Audit event recorded for document ID: ${doc.id || doc._id}`
                }))
              )
              .catch(() => [])
          );

          const nestedLogs = await Promise.all(auditPromises);
          const allLogs = nestedLogs.flat();

          // Step 3: Sort entries chronologically (newest first)
          allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTimelineEvents(allLogs);
        } else {
          setTimelineEvents([]);
        }
      } catch (err) {
        console.error("Error fetching live case/audit data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (caseId) {
      fetchCaseAndAuditData();
    }
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex items-center space-x-3 text-slate-600">
          <Clock className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium">Fetching live case audit logs...</span>
        </div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Unable to Load Case Timeline</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1">{error || "Case record not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Navigation Header */}
      <nav className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="p-1 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold tracking-wider uppercase text-slate-400">
            Case Details & Audit Trail
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> BSA Section 63 Compliant
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
                  {caseData.case_number || caseData.id}
                </span>
                <StatusBadge status={caseData.status} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{caseData.title || "Untitled Case"}</h1>
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
            {caseData.description || "No description available for this case."}
          </p>

          {/* Key Metadata Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center text-slate-600">
              <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>Created By: <strong className="text-slate-800">{caseData.created_by || "System Admin"}</strong></span>
            </div>
            <div className="flex items-center text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <span>Created Date: <strong className="text-slate-800">{caseData.created_at ? new Date(caseData.created_at).toLocaleString() : "N/A"}</strong></span>
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
              <History className="w-5 h-5 text-blue-600" /> Live Audit Log Timeline
            </h2>

            {/* Dynamic Vertical Timeline Component */}
            <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 my-4 ml-2">
              {timelineEvents.length > 0 ? (
                timelineEvents.map((event, idx) => (
                  <TimelineEventItem key={event.id || idx} event={event} />
                ))
              ) : (
                <div className="text-slate-500 text-sm py-4">No audit events logged for this case yet.</div>
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
            {event.date ? new Date(event.date).toLocaleString() : 'N/A'}
          </time>
        </div>

        <p className="text-xs text-slate-600 mb-3">{event.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Actor: <strong className="text-slate-700">{event.actor}</strong>
          </span>
          <div className="font-mono text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded truncate max-w-xs" title={`Hash: ${event.hash}`}>
            Hash: {event.hash ? event.hash.substring(0, 16) : 'N/A'}...
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
      {status ? status.replace('_', ' ') : 'OPEN'}
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
        This view is scheduled to be connected to backend APIs during subsequent integration checkpoints.
      </p>
    </div>
  );
}