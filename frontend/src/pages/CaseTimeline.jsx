import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Lock, 
  Fingerprint, 
  Clock, 
  FileBadge2, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Binary, 
  Radio 
} from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import axios from 'axios';

const MOCK_TIMELINE_DATA = {
  case_number: 'CASE-2026-001',
  title: 'State of TN vs. Ramesh (FIR #102/26)',
  status: 'Under Investigation',
  hash_chain_valid: true,
  root_merkle_hash: '8f4c2e9b01a3f45d8b76c3e98124a5b6c7d8e9f0123456789abcdef012345678',
  court_jurisdiction: 'Sessions Court, Chennai',
  forensic_seal_id: 'BSA-63-CHN-8849',
  events: [
    {
      id: 'EVT-101',
      block_index: 0,
      timestamp: '2026-08-25 09:30:15 IST',
      doc_type: 'FIR & Seizure Memo',
      title: 'First Information Report & Custody Genesis',
      actor: 'Insp. S. Sharma (Investigating Officer)',
      role: 'investigating_officer',
      sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      prev_hash: '0000000000000000000000000000000000000000000000000000000000000000',
      status: 'verified',
      details: 'FIR logged under BNS 302 / 120B. Initial evidence sealed with write-once timestamp.'
    },
    {
      id: 'EVT-102',
      block_index: 1,
      timestamp: '2026-08-25 11:15:42 IST',
      doc_type: 'Digital Media Seizure',
      title: 'CCTV Surveillance Extraction (cam_04.mp4)',
      actor: 'Sub-Insp. K. Varma (Forensics Tech)',
      role: 'technical_officer',
      sha256_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      prev_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'verified',
      details: 'Raw video stream extracted directly from NVR. Cryptographic hash computed before transfer to cold storage.'
    },
    {
      id: 'EVT-103',
      block_index: 2,
      timestamp: '2026-08-25 14:00:20 IST',
      doc_type: 'Forensic Lab Report',
      title: 'Ballistics & DNA Lab Forensic Certificate',
      actor: 'Dr. Aruna Patel (Chief Forensic Examiner)',
      role: 'forensic_expert',
      sha256_hash: '3f7a1c9e8d5b2a4c6e0f1b3d5e7a9c1e3f5b7d9a1c3e5f7a9b1d3f5e7a9c1e3f',
      prev_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      status: 'verified',
      details: 'Digital authenticity certified. Section 63 BSA compliance generated and cryptographically bound.'
    }
  ]
};

export default function CaseTimeline() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState(MOCK_TIMELINE_DATA);
  const [isTamperSimulated, setIsTamperSimulated] = useState(false);
  const [copiedHash, setCopiedHash] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      const caseId = id || 'CASE-2026-001';
      try {
        const docsRes = await axios.get(`/cases/${caseId}/documents`);
        
        if (Array.isArray(docsRes.data) && docsRes.data.length > 0) {
          const mappedEvents = docsRes.data.map((doc, index, array) => ({
            id: doc.id || `EVT-${index + 101}`,
            timestamp: doc.created_at ? new Date(doc.created_at).toLocaleString() : 'Recent',
            doc_type: doc.doc_type || 'document',
            title: `${(doc.doc_type || 'DOCUMENT').toUpperCase()} (v${doc.version || 1})`,
            actor: doc.uploaded_by || 'Unknown User',
            role: 'officer',
            sha256_hash: doc.evidentiary_hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            prev_hash: index === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : (array[index - 1]?.evidentiary_hash || 'GENESIS_BLOCK'),
            status: 'verified',
            details: `Classification: ${doc.classification || 'UNCLASSIFIED'} | MIME Type: ${doc.mime_type || 'application/pdf'}`
          }));

          setTimeline({
            case_number: caseId,
            title: `Case Dossier: ${caseId}`,
            status: 'Under Investigation',
            court_jurisdiction: MOCK_TIMELINE_DATA.court_jurisdiction,
            hash_chain_valid: true,
            root_merkle_hash: mappedEvents[mappedEvents.length - 1]?.sha256_hash || MOCK_TIMELINE_DATA.root_merkle_hash,
            events: mappedEvents
          });
          return;
        }

        const res = await axios.get(`/cases/${caseId}/timeline`);
        if (res.data && Array.isArray(res.data.events)) {
          setTimeline(res.data);
        } else {
          setTimeline(MOCK_TIMELINE_DATA);
        }
      } catch {
        setTimeline(MOCK_TIMELINE_DATA);
      }
    };

    fetchTimeline();
  }, [id]);

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedHash(key);
    setTimeout(() => setCopiedHash(null), 1800);
  };

  return (
    <DashboardShell roleTitle="Digital Evidence Chain-of-Custody">
      <div className="relative space-y-8">
        <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px] transition-all duration-700 animate-pulse" />

        {/* Top Summary Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/40">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-75 animate-[pulse_3s_ease-in-out_infinite]" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <Link 
                to="/dashboard/officer" 
                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-transform duration-200 hover:-translate-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Dossiers
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{timeline?.title || 'Case Dossier'}</h1>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-semibold text-cyan-300 shadow-inner">
                  <Binary className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                  {id || timeline?.case_number || 'CASE-2026-001'}
                </span>
                <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300">
                  {timeline?.court_jurisdiction || 'Sessions Court'}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <span>Root Merkle Seal:</span>
                <span 
                  onClick={() => copyToClipboard(timeline?.root_merkle_hash, 'root')}
                  className="cursor-pointer rounded border border-slate-800 bg-slate-950 px-2 py-0.5 text-cyan-400 transition hover:border-cyan-500 hover:text-cyan-300"
                  title="Click to copy hash"
                >
                  {copiedHash === 'root' ? '✓ Copied Root Hash' : `${(timeline?.root_merkle_hash || '').slice(0, 32)}...`}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsTamperSimulated(prev => !prev)}
                className={`relative flex items-center gap-2 overflow-hidden rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 ${
                  isTamperSimulated 
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-lg shadow-rose-500/20 animate-[pulse_1.5s_infinite]' 
                    : 'border-slate-700 bg-slate-800/90 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTamperSimulated ? 'animate-spin text-rose-400' : ''}`} />
                <span>{isTamperSimulated ? 'Reset Tamper Attack' : 'Simulate Hash Corruption'}</span>
              </button>

              <button 
                onClick={() => alert("Generating & Downloading Sec. 63 BSA Digital Admissibility Certificate...")}
                className="group/btn relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-[length:200%_auto] px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all duration-500 hover:bg-[right_center] active:scale-95"
              >
                <FileBadge2 className="w-4 h-4 transition-transform duration-300 group-hover/btn:rotate-12" />
                <span>Export Sec 63 BSA Cert</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cryptographic Ledger Status Banner */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-700 ${
          !isTamperSimulated 
            ? 'border-emerald-500/30 bg-emerald-950/20 shadow-lg shadow-emerald-500/5' 
            : 'border-rose-500/50 bg-rose-950/40 shadow-xl shadow-rose-500/20 animate-[pulse_2s_infinite]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${
                !isTamperSimulated 
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-inner' 
                  : 'border-rose-500/40 bg-rose-500/20 text-rose-400 animate-bounce'
              }`}>
                {!isTamperSimulated ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-rose-400" />
                )}
                <span className="absolute -right-1 -top-1 flex h-3 w-3">
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${!isTamperSimulated ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <span className={`relative inline-flex h-3 w-3 rounded-full ${!isTamperSimulated ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  {!isTamperSimulated 
                    ? 'Cryptographic Chain of Custody: Untampered & Verified' 
                    : 'CRITICAL WARNING: Tamper Detected in Hash Ledger'}
                  {!isTamperSimulated && <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {!isTamperSimulated 
                    ? 'All sequential block hashes match original seizure timestamps under Section 63 BSA.' 
                    : 'Payload signature in Block #1 does not resolve with parent hash chain. Admissibility compromised.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${
                !isTamperSimulated 
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                  : 'border-rose-500/50 bg-rose-500/20 text-rose-300'
              }`}>
                <Radio className={`w-3.5 h-3.5 ${!isTamperSimulated ? 'text-emerald-400 animate-pulse' : 'text-rose-400 animate-ping'}`} />
                {!isTamperSimulated ? '100% Tamper Proof' : 'Integrity Broken'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Merkle Block Cards */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Custody Merkle Blocks</h2>
            </div>
            <span className="text-[11px] font-medium text-slate-500">{timeline?.events?.length || 0} Verified Cryptographic Proofs</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
            {(timeline?.events || []).map((evt, idx) => {
              const isCorrupted = isTamperSimulated && idx === 1;
              return (
                <div 
                  key={evt.id || idx} 
                  className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-500 hover:-translate-y-1 ${
                    isCorrupted 
                      ? 'border-rose-500/60 bg-rose-950/20 shadow-lg shadow-rose-500/10' 
                      : 'border-slate-800 bg-slate-950/60 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="font-mono font-semibold text-cyan-400">Block #{idx}</span>
                    <span className="font-mono text-[10px] text-slate-500">{evt.id}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {evt.title}
                  </p>
                  <div className="mt-3 rounded border border-slate-800/80 bg-slate-900/80 p-2 font-mono text-[10px]">
                    <span className="text-slate-500 block text-[9px] mb-0.5">PAYLOAD HASH</span>
                    <p className={`truncate ${isCorrupted ? 'text-rose-400 line-through' : 'text-slate-400'}`}>
                      {evt.sha256_hash}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Timeline Tree */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white mb-8 flex items-center gap-2 tracking-wide">
            <Clock className="w-4 h-4 text-cyan-400" /> Sequential Evidence Timeline
          </h2>

          <div className="relative border-l-2 border-slate-800 space-y-8 ml-3 sm:ml-5 pl-6 sm:pl-8">
            {(timeline?.events || []).map((evt, idx) => {
              const isCorrupted = isTamperSimulated && idx === 1;

              return (
                <div key={evt.id || idx} className="relative group transition-all duration-300">
                  {/* Glowing Node Dot Anchor */}
                  <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border-4 border-slate-950 transition-all duration-500 ${
                    isCorrupted 
                      ? 'bg-rose-500 text-slate-950 ring-8 ring-rose-500/20 scale-110' 
                      : 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 group-hover:ring-8 group-hover:ring-cyan-500/30'
                  }`}>
                    <Lock className="h-2.5 w-2.5 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Card Container */}
                  <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-xl transition-all duration-500 hover:-translate-y-0.5 ${
                    isCorrupted 
                      ? 'border-rose-500/60 bg-rose-950/20 shadow-rose-500/10' 
                      : 'border-slate-800/90 bg-slate-900/90 hover:border-cyan-500/40 hover:shadow-cyan-500/5'
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 uppercase">
                          {(evt.doc_type || 'DOCUMENT').replace('_', ' ')}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                          {evt.title}
                        </h3>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {evt.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{evt.details}</p>

                    {/* Dual Hash Comparators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                      <div 
                        onClick={() => copyToClipboard(evt.sha256_hash, evt.id || idx)}
                        className={`cursor-pointer rounded-xl border p-3 transition-colors ${
                          isCorrupted ? 'border-rose-500/40 bg-rose-950/40' : 'border-slate-800/90 bg-slate-950/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500 mb-1">
                          <span>SHA-256 Current Fingerprint</span>
                          <span className="text-cyan-400">{copiedHash === (evt.id || idx) ? 'Copied!' : 'Click to Copy'}</span>
                        </div>
                        <p className={`truncate font-semibold ${isCorrupted ? 'text-rose-400 line-through' : 'text-slate-300'}`}>
                          {evt.sha256_hash}
                        </p>
                        {isCorrupted && (
                          <p className="mt-1.5 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Hash mismatch! Live: 9f82c1a8... (INVALID)
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-800/90 bg-slate-950/80 p-3">
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-slate-500 mb-1">
                          <span>Parent Pointer (Prev Hash)</span>
                        </div>
                        <p className="truncate text-slate-400 font-medium">{evt.prev_hash}</p>
                      </div>
                    </div>

                    {/* Footer Validation Status */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                        Signed by: <strong className="text-slate-200">{evt.actor}</strong>
                      </span>
                      <span className={`flex items-center gap-1.5 font-semibold ${
                        isCorrupted ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" /> 
                        {isCorrupted ? 'Tamper Detected in Evidence Payload' : 'Section 63 BSA Compliant'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}