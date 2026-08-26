import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
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
  Loader2,
  ShieldAlert
} from 'lucide-react';

import { apiFetch } from './src/api/client';

export default function ChainOfCustodyLedger({ documentId }) {
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    async function fetchAuditLog() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/documents/${documentId}/audit-log`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Audit log response was not an array.');
        setAuditLog(data);
      } catch (err) {
        setError(err.message || 'Unable to load the audit log.');
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

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-rose-200 p-6 text-sm text-rose-700">
        <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="w-5 h-5" /> Unable to load audit ledger</div>
        <p className="mt-2 text-rose-600">{error}</p>
      </div>
    );
  }

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
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Tamper-Evident
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

      {/* --- VISUAL CHAIN LIST --- */}
      <div className="relative pl-6 sm:pl-8 space-y-8">
        
        {/* Continuous Cryptographic Line Anchor */}
        <div className="absolute left-[15px] sm:left-[19px] top-3 bottom-6 w-0.5 bg-slate-200" />

        {auditLog.map((event, index) => {
          const eventKey = event.event_hash || index;
          const isExpanded = !!expandedNodes[eventKey];

          return (
            <div key={eventKey} className="relative group">
              
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
                  </div>
                  <div className="flex items-center text-xs text-slate-500 font-mono bg-white px-2.5 py-1 rounded border border-slate-200">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>

                {/* Actor Info */}
                <div className="flex items-center text-xs text-slate-700 mb-4">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span>Logged Actor: <strong className="text-slate-900 font-medium">{event.actor}</strong></span>
                </div>

                {/* --- CRYPTOGRAPHIC CONTINUITY BOX --- */}
                <div className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono space-y-2 border border-slate-800">
                  
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
                    onClick={() => toggleExpand(eventKey)}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <span>{isExpanded ? "Hide Full Cryptographic Offsets" : "View Full Hashes & Offsets"}</span>
                  </button>

                </div>

                {/* Expanded Full Hash View Section */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono space-y-2 animate-in fade-in duration-150">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Full Event Hash (SHA-256)</div>
                      <div className="p-1.5 bg-white rounded border border-slate-200 text-emerald-700 font-bold break-all text-[11px] select-all mt-0.5">
                        {event.event_hash || 'N/A'}
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

function HashPill({ hash, highlight = false }) {
  const [copied, setCopied] = useState(false);

  const truncatedHash = hash
    ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
    : 'N/A';

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
      {hash && (
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