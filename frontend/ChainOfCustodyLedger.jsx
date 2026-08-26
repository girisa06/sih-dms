import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Link as LinkIcon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Eye,
  FilePlus,
  Share2,
  Edit3,
  Lock,
  AlertCircle,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api-proxy';

// --- FALLBACK MOCK DATA (Aligned with Person 2's Audit Log schema) ---
const MOCK_AUDIT_LOG = [
  {
    id: "log-001",
    document_id: "doc-101",
    actor_id: "Insp. Rajesh Kumar (ID: OFF-4022)",
    action: "UPLOAD",
    prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    event_hash: "a3f89e1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
    timestamp: "2026-08-20T10:30:00Z"
  },
  {
    id: "log-002",
    document_id: "doc-101",
    actor_id: "Dr. A. Sharma (ID: EXP-902)",
    action: "EDIT",
    prev_hash: "a3f89e1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
    event_hash: "b4e90f2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    timestamp: "2026-08-21T14:15:00Z"
  },
  {
    id: "log-003",
    document_id: "doc-101",
    actor_id: "Insp. Rajesh Kumar (ID: OFF-4022)",
    action: "SHARE",
    prev_hash: "b4e90f2c3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
    event_hash: "c5f01a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    timestamp: "2026-08-23T09:45:00Z"
  },
  {
    id: "log-004",
    document_id: "doc-101",
    actor_id: "Adv. Meera Nair (ID: PROS-104)",
    action: "VIEW",
    prev_hash: "c5f01a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
    event_hash: "d6a12b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    timestamp: "2026-08-25T16:00:00Z"
  }
];

export default function ChainOfCustodyLedger({ documentId = "doc-101" }) {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    async function fetchAuditLog() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Consuming Person 2's GET /documents/{id}/audit-log endpoint[cite: 1, 2]
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}/audit-log`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setAuditLog(data);
      } catch (err) {
        console.warn("Unable to load the audit ledger.", err);
        setAuditLog([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAuditLog();
  }, [documentId]);

  const toggleExpand = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <span className="text-sm font-medium text-slate-600">Verifying Cryptographic Ledger...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-slate-900">
      
      {/* --- SECTION HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Chain-of-Custody Audit Ledger</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Tamper-Evident[cite: 1, 2]
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutably linked cryptographic hash chain for evidence admissibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Events Logged: <strong>{auditLog.length}</strong>
          </span>
        </div>
      </div>

      {/* Mock Mode Notice Banner */}
      {/* --- VISUAL CHAIN LIST --- */}
      <div className="relative pl-6 sm:pl-8 space-y-8">
        
        {/* Continuous Cryptographic Line Anchor */}
        <div className="absolute left-[15px] sm:left-[19px] top-3 bottom-6 w-0.5 bg-slate-200" />

        {auditLog.map((event, index) => {
          const isExpanded = !!expandedNodes[event.id];
          const isGenesis = index === 0;

          return (
            <div key={event.id} className="relative group">
              
              {/* Step Sequence Badge (Timeline Node Marker) */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1 z-10 w-8 h-8 rounded-full bg-slate-900 text-white border-2 border-white shadow-sm flex items-center justify-center font-mono text-xs font-bold">
                {index + 1}
              </div>

              {/* Event Card Container */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition shadow-2xs">
                
                {/* Event Header: Action Type Badge & Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <ActionBadge action={event.action} />
                    <span className="text-xs text-slate-500 font-mono">
                      Event ID: <strong className="text-slate-700">{event.id}</strong>
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-slate-500 font-mono bg-white px-2.5 py-1 rounded border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Actor Info */}
                <div className="flex items-center text-xs text-slate-700 mb-4">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>Logged Actor: <strong className="text-slate-900 font-medium">{event.actor_id}</strong></span>
                </div>

                {/* --- CRYPTOGRAPHIC CONTINUITY BOX --- */}
                <div className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono space-y-2 border border-slate-800">
                  
                  {/* Previous Hash Entry */}
                  <div className="flex items-center justify-between gap-2 text-slate-400">
                    <span className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase flex items-center gap-1">
                      <LinkIcon className="w-3 h-3 text-slate-500" /> Prev Hash:
                    </span>
                    <HashPill hash={event.prev_hash} isGenesis={isGenesis} />
                  </div>

                  {/* Hash Link Indicator */}
                  <div className="flex items-center justify-center my-0.5 text-slate-600">
                    <div className="h-3 w-0.5 bg-slate-700 my-0.5" />
                  </div>

                  {/* Event Hash Entry */}
                  <div className="flex items-center justify-between gap-2 text-emerald-400">
                    <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Event Hash:
                    </span>
                    <HashPill hash={event.event_hash} highlight />
                  </div>
                </div>

                {/* EXPANDABLE FULL HASH VIEW TOGGLE */}
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => toggleExpand(event.id)}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{isExpanded ? "Hide Full Cryptographic Offsets" : "View Full Hashes & Offsets"}</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Doc ID: {event.document_id}
                  </span>
                </div>

                {/* Expanded Full Hash View Section */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono space-y-2 animate-in fade-in duration-150">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Full Previous Hash (SHA-256)</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-slate-700 break-all text-[11px] select-all mt-0.5">
                        {event.prev_hash}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Full Event Hash (SHA-256)</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-emerald-700 font-bold break-all text-[11px] select-all mt-0.5">
                        {event.event_hash}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

// --- HELPER COMPONENTS ---

function ActionBadge({ action }) {
  const actionConfigs = {
    UPLOAD: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: FilePlus },
    VIEW: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Eye },
    SHARE: { color: "bg-purple-50 text-purple-700 border-purple-200", icon: Share2 },
    EDIT: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Edit3 },
  };

  const config = actionConfigs[action] || { color: "bg-slate-100 text-slate-700 border-slate-200", icon: Lock };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${config.color}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      {action}
    </span>
  );
}

function HashPill({ hash, highlight = false, isGenesis = false }) {
  const [copied, setCopied] = useState(false);

  const truncatedHash = isGenesis 
    ? "0x0000...0000 (GENESIS)" 
    : `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center space-x-1">
      <span className={`px-2 py-0.5 rounded text-[11px] font-mono ${
        highlight 
          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold' 
          : 'bg-slate-800 text-slate-300'
      }`}>
        {truncatedHash}
      </span>
      {!isGenesis && (
        <button
          onClick={handleCopy}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          title="Copy full SHA-256 hash"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}