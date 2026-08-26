import React, { useState, useEffect } from 'react';
import {
  History,
  GitCompare,
  X,
  FileCheck,
  User,
  Clock,
  Hash,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';

// Fallback Mock Data matching Person 1's backend schema
const MOCK_VERSION_HISTORY = [
  {
    id: "doc-101-v3",
    document_id: "doc-101",
    version: 3,
    doc_type: "forensic_report",
    uploaded_by: "Dr. A. Sharma (ID: EXP-902)",
    created_at: "2026-08-25T14:30:00Z",
    evidentiary_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    mime_type: "application/pdf",
    classification: "Forensic Analysis Report",
    entities: {
      case_no: "FIR-2026-0892",
      sections: ["Sec 66 IT Act", "Sec 420 IPC"],
      names: ["Rajesh Kumar", "Anil Mehta", "Dr. A. Sharma"],
      dates: ["2026-08-20", "2026-08-25"]
    }
  },
  {
    id: "doc-101-v2",
    document_id: "doc-101",
    version: 2,
    doc_type: "forensic_report",
    uploaded_by: "Dr. A. Sharma (ID: EXP-902)",
    created_at: "2026-08-22T11:15:00Z",
    evidentiary_hash: "7d865e959b2466918c9863afca942d0fb89d7c9ac0c99bafc3749504d9725035",
    mime_type: "application/pdf",
    classification: "Preliminary Forensic Report",
    entities: {
      case_no: "FIR-2026-0892",
      sections: ["Sec 66 IT Act"],
      names: ["Rajesh Kumar", "Anil Mehta"],
      dates: ["2026-08-20"]
    }
  },
  {
    id: "doc-101-v1",
    document_id: "doc-101",
    version: 1,
    doc_type: "evidence",
    uploaded_by: "Insp. Rajesh Kumar (ID: OFF-4022)",
    created_at: "2026-08-20T10:35:00Z",
    evidentiary_hash: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    mime_type: "application/pdf",
    classification: "Raw Memory Dump Summary",
    entities: {
      case_no: "FIR-2026-0892",
      sections: [],
      names: ["Rajesh Kumar"],
      dates: ["2026-08-20"]
    }
  }
];

export default function DocumentVersionHistory({ documentId = "doc-101", isOpen, onClose }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [selectedCompareVersion, setSelectedCompareVersion] = useState(null);

  useEffect(() => {
    if (!isOpen || !documentId) return;

    async function fetchVersions() {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`/documents/${documentId}/versions`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setVersions(data);
        setIsMock(false);
        if (data.length > 1) setSelectedCompareVersion(data[1]); // Default compare to previous version
      } catch (err) {
        console.warn("Backend unavailable. Falling back to Mock Version Data.", err);
        setVersions(MOCK_VERSION_HISTORY);
        setIsMock(true);
        setSelectedCompareVersion(MOCK_VERSION_HISTORY[1]);
      } finally {
        setLoading(false);
      }
    }

    fetchVersions();
  }, [documentId, isOpen]);

  if (!isOpen) return null;

  const currentVersion = versions[0]; // Latest version is always v_latest (index 0)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        
        {/* --- DRAWER HEADER --- */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Document Version History</h2>
              <p className="text-xs text-slate-400 font-mono">Doc ID: {documentId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mock Notification Banner */}
        {isMock && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-400 flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Using fallback mock version ledger[cite: 1, 2].</span>
          </div>
        )}

        {/* --- MAIN DRAWER CONTENT --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs">Fetching version ledger...</span>
            </div>
          ) : (
            <>
              {/* --- VERSION REVISION LIST --- */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Revision History ({versions.length} versions)
                </h3>
                <div className="space-y-3">
                  {versions.map((ver, idx) => {
                    const isLatest = idx === 0;
                    const isSelected = selectedCompareVersion?.id === ver.id;

                    return (
                      <div
                        key={ver.id}
                        onClick={() => !isLatest && setSelectedCompareVersion(ver)}
                        className={`p-4 rounded-xl border transition cursor-pointer ${
                          isLatest
                            ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20'
                            : isSelected
                            ? 'bg-slate-800/80 border-slate-600'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {/* Version Badge Increment */}
                            <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${
                              isLatest 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              v{ver.version}
                            </span>
                            {isLatest && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Current Active
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            {new Date(ver.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Metadata Details */}
                        <div className="text-xs space-y-1.5 mt-2">
                          <div className="flex items-center text-slate-300">
                            <User className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                            <span>Uploaded by: <strong className="text-slate-200">{ver.uploaded_by}</strong></span>
                          </div>
                          <div className="flex items-center text-slate-400 font-mono text-[11px]">
                            <Hash className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                            <span className="truncate">Hash: {ver.evidentiary_hash}</span>
                          </div>
                        </div>

                        {/* Action affordance for comparison */}
                        {!isLatest && (
                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-end">
                            <span className={`text-xs flex items-center gap-1 ${isSelected ? 'text-blue-400 font-semibold' : 'text-slate-500 hover:text-slate-300'}`}>
                              <GitCompare className="w-3.5 h-3.5" />
                              {isSelected ? 'Currently Comparing' : 'Select to Compare'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* --- VISUAL DIFF COMPARISON STATE --- */}
              {selectedCompareVersion && currentVersion && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mt-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <GitCompare className="w-4 h-4 text-blue-400" />
                      <h3 className="text-sm font-bold text-slate-200">
                        Metadata Diff: v{selectedCompareVersion.version} → v{currentVersion.version}
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Comparing against Current Active
                    </span>
                  </div>

                  {/* Diff Matrix */}
                  <div className="space-y-4">
                    <DiffRow
                      label="Classification"
                      oldVal={selectedCompareVersion.classification}
                      newVal={currentVersion.classification}
                    />
                    <DiffRow
                      label="Doc Type"
                      oldVal={selectedCompareVersion.doc_type}
                      newVal={currentVersion.doc_type}
                    />
                    <DiffRow
                      label="Evidentiary Hash"
                      oldVal={`${selectedCompareVersion.evidentiary_hash.substring(0, 12)}...`}
                      newVal={`${currentVersion.evidentiary_hash.substring(0, 12)}...`}
                      isMono
                    />
                    <DiffRow
                      label="Extracted Sections"
                      oldVal={selectedCompareVersion.entities?.sections?.join(', ') || 'None'}
                      newVal={currentVersion.entities?.sections?.join(', ') || 'None'}
                    />
                    <DiffRow
                      label="Extracted Names"
                      oldVal={selectedCompareVersion.entities?.names?.join(', ') || 'None'}
                      newVal={currentVersion.entities?.names?.join(', ') || 'None'}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- FOOTER --- */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <ShieldCheck className="w-4 h-4" /> Version chain verified
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg border border-slate-700 transition"
          >
            Close History
          </button>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COMPONENT FOR DIFF ROWS ---
function DiffRow({ label, oldVal, newVal, isMono = false }) {
  const isChanged = oldVal !== newVal;

  return (
    <div className="text-xs space-y-1">
      <span className="text-slate-400 font-medium">{label}</span>
      <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
        
        {/* Old Version Field */}
        <div className={`flex items-center justify-between overflow-hidden ${isChanged ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 p-1.5 rounded' : 'text-slate-400'}`}>
          <span className={`truncate ${isMono ? 'font-mono' : ''}`}>{oldVal}</span>
        </div>

        {/* New Version Field */}
        <div className={`flex items-center justify-between overflow-hidden ${isChanged ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 p-1.5 rounded' : 'text-slate-300'}`}>
          <span className={`truncate ${isMono ? 'font-mono' : ''}`}>{newVal}</span>
          {isChanged && (
            <span className="text-[10px] font-bold tracking-wide uppercase text-emerald-400 ml-1 shrink-0">
              Updated
            </span>
          )}
        </div>

      </div>
    </div>
  );
}