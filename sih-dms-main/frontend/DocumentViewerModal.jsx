import React, { useState } from 'react';
import { X, FileText, Download, ShieldCheck, History, Eye, CheckCircle } from 'lucide-react';

export default function DocumentViewerModal({ isOpen, onClose, documentData }) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'versions'

  if (!isOpen) return null;

  const doc = documentData || {
    id: 'DOC-2026-001',
    title: 'First Information Report (FIR #102/26)',
    file_name: 'FIR_102_2026_Signed.pdf',
    doc_type: 'FIR',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploaded_by: 'Insp. S. Sharma',
    uploaded_at: '2026-08-25 09:30 IST',
    version: 'v1.2',
    versions: [
      { ver: 'v1.2', date: '2026-08-25 09:30', hash: 'e3b0c442...', note: 'Added ballistics annexure' },
      { ver: 'v1.0', date: '2026-08-25 08:00', hash: 'a1b2c3d4...', note: 'Initial FIR ingestion' }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {doc.title}
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  {doc.version}
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">SHA-256: {doc.sha256.slice(0, 28)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
                  activeTab === 'preview' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Viewer
              </button>
              <button
                onClick={() => setActiveTab('versions')}
                className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition ${
                  activeTab === 'versions' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Version Diff
              </button>
            </div>

            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-950/50">
          {activeTab === 'preview' ? (
            <div className="h-full border border-slate-800 rounded-xl bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden p-6">
              {/* Security Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 rotate-[-25deg]">
                <span className="text-6xl font-black tracking-widest text-white uppercase select-none">
                  EVIDENTIARY VAULT • SECURE COPY
                </span>
              </div>

              <div className="text-center space-y-3 z-10 max-w-md">
                <FileText className="w-16 h-16 text-cyan-400 mx-auto opacity-80" />
                <h4 className="text-base font-bold text-white">{doc.file_name}</h4>
                <p className="text-xs text-slate-400">
                  Uploaded by <strong className="text-slate-200">{doc.uploaded_by}</strong> on {doc.uploaded_at}
                </p>
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Cryptographic Seal & Chain-of-Custody Intact
                </div>
              </div>
            </div>
          ) : (
            /* Version History Diff Tab */
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Audit Trail Version History</h4>
              <div className="space-y-2">
                {doc.versions.map((v, i) => (
                  <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-400 font-mono">{v.ver}</span>
                        <span className="text-slate-300 font-medium">{v.note}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">Hash: {v.hash} • {v.date}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {i === 0 ? 'Current Active' : 'Archived Snapshot'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}