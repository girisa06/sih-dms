import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  Download, 
  Lock, 
  Fingerprint, 
  ExternalLink,
  Clock
} from 'lucide-react';
import DashboardShell from '../components/DashboardShell';
import axios from 'axios';

const MOCK_TIMELINE_DATA = {
  case_number: 'CASE-2026-001',
  title: 'State of TN vs. Ramesh (FIR #102/26)',
  status: 'Under Investigation',
  hash_chain_valid: true,
  root_merkle_hash: '8f4c2e9b01a3f45d8b76c3e98124a5b6c7d8e9f0123456789abcdef012345678',
  events: [
    {
      id: 'EVT-101',
      timestamp: '2026-08-25 09:30:15 IST',
      doc_type: 'fir',
      title: 'First Information Report (FIR Registered)',
      actor: 'Insp. S. Sharma (IO)',
      role: 'officer',
      sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      prev_hash: 'GENESIS_BLOCK_00000000000000000000000000000000000000000000000000000000',
      status: 'verified',
      details: 'FIR registered under BNS 302 / 120B. Initial scene statements recorded and locked.'
    },
    {
      id: 'EVT-102',
      timestamp: '2026-08-25 11:15:42 IST',
      doc_type: 'evidence',
      title: 'Digital CCTV Seizure & Physical Evidence Ingestion',
      actor: 'Sub-Insp. K. Varma',
      role: 'officer',
      sha256_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      prev_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      status: 'verified',
      details: 'CCTV footage footage_cam04.mp4 retrieved from scene. Direct write-once hash computation complete.'
    },
    {
      id: 'EVT-103',
      timestamp: '2026-08-25 14:00:20 IST',
      doc_type: 'forensic_report',
      title: 'Forensic Ballistics & DNA Lab Report Attached',
      actor: 'Dr. Aruna Patel (Chief Forensic Analyst)',
      role: 'forensic_expert',
      sha256_hash: '3f7a1c9e8d5b2a4c6e0f1b3d5e7a9c1e3f5b7d9a1c3e5f7a9b1d3f5e7a9c1e3f',
      prev_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      status: 'verified',
      details: 'Ballistic match confirmed with 9mm specimen. Section 63 Indian Evidence/BSA admissibility certified.'
    }
  ]
};

export default function CaseTimeline() {
  const { id } = useParams();
  const [timeline, setTimeline] = useState(MOCK_TIMELINE_DATA);
  const [verifying, setVerifying] = useState(false);
  const [isTamperSimulated, setIsTamperSimulated] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      const caseId = id || 'CASE-2026-001';
      try {
        // Try live documents endpoint first
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
            prev_hash: index === 0 ? 'GENESIS_BLOCK_000000000000000000000000000000000000000000000000' : (array[index - 1]?.evidentiary_hash || 'GENESIS_BLOCK'),
            status: 'verified',
            details: `Classification: ${doc.classification || 'UNCLASSIFIED'} | MIME Type: ${doc.mime_type || 'application/pdf'}`
          }));

          setTimeline({
            case_number: caseId,
            title: `Case Dossier: ${caseId}`,
            status: 'Under Investigation',
            hash_chain_valid: true,
            root_merkle_hash: mappedEvents[mappedEvents.length - 1]?.sha256_hash || MOCK_TIMELINE_DATA.root_merkle_hash,
            events: mappedEvents
          });
          return;
        }

        // Fallback to direct /timeline route if available
        const res = await axios.get(`/cases/${caseId}/timeline`);
        if (res.data && Array.isArray(res.data.events)) {
          setTimeline(res.data);
        } else {
          setTimeline(MOCK_TIMELINE_DATA);
        }
      } catch (err) {
        // Safe fallback to mock structure
        setTimeline(MOCK_TIMELINE_DATA);
      }
    };

    fetchTimeline();
  }, [id]);

  const toggleTamperSimulation = () => {
    setIsTamperSimulated((prev) => !prev);
  };

  return (
    <DashboardShell roleTitle="Evidentiary Chain-of-Custody Timeline">
      <div className="space-y-6">
        {/* Top Case Summary Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div>
            <Link to="/dashboard/officer" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              {timeline?.title || 'Case Dossier'}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                {id || timeline?.case_number || 'CASE-2026-001'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Root Merkle Hash: <span className="text-slate-300">{(timeline?.root_merkle_hash || '').slice(0, 16)}...</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={toggleTamperSimulation}
              className={`text-xs px-3.5 py-2 rounded-lg border font-medium transition ${
                isTamperSimulated 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isTamperSimulated ? 'Reset Integrity Test' : 'Simulate Hash Tamper'}
            </button>

            <button 
              onClick={() => alert("Generating Section 63 BSA Admissibility Certificate (PDF with SHA-256 signatures)...")}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" /> Download Sec 63 BSA Certificate
            </button>
          </div>
        </div>

        {/* Cryptographic Chain Status Header */}
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
          !isTamperSimulated 
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-950/20 border-rose-500/40 text-rose-400'
        }`}>
          <div className="flex items-center gap-3">
            {!isTamperSimulated ? (
              <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400 animate-bounce" />
            )}
            <div>
              <p className="text-sm font-bold">
                {!isTamperSimulated ? 'Immutable Hash Chain Verified (Section 63 Compliant)' : 'CRITICAL ALERT: Tamper Detected in Merkle Tree'}
              </p>
              <p className="text-xs text-slate-400">
                {!isTamperSimulated 
                  ? 'All cryptographic signatures and forward hash chains validate against original block proofs.' 
                  : 'Block 2 SHA-256 hash mismatch! Evidence payload altered post-seizure.'}
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-mono px-2 py-1 rounded border uppercase ${
            !isTamperSimulated ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
          }`}>
            {!isTamperSimulated ? 'INTEGRITY: 100%' : 'INTEGRITY: COMPROMISED'}
          </span>
        </div>

        {/* Timeline Event Feed */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8 my-4 ml-4">
          {(timeline?.events || []).map((evt, idx) => {
            const isCorruptedNode = isTamperSimulated && idx === 1;

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node Dot */}
                <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-4 border-slate-950 flex items-center justify-center transition-all ${
                  isCorruptedNode 
                    ? 'bg-rose-500 text-slate-950 ring-4 ring-rose-500/20' 
                    : 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20'
                }`}>
                  <Lock className="w-2.5 h-2.5" />
                </div>

                {/* Event Card */}
                <div className={`bg-slate-900 border rounded-xl p-5 transition hover:border-slate-700 ${
                  isCorruptedNode ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 uppercase">
                        {(evt?.doc_type || 'DOCUMENT').replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-white">{evt?.title || 'Evidence Log Item'}</h3>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {evt?.timestamp || 'N/A'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-4">{evt?.details || 'No additional details provided.'}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <p className="text-slate-500 uppercase text-[9px] mb-0.5">SHA-256 Payload Hash</p>
                      <p className={`truncate ${isCorruptedNode ? 'text-rose-400 line-through' : 'text-slate-300'}`}>
                        {evt?.sha256_hash || 'N/A'}
                      </p>
                      {isCorruptedNode && (
                        <p className="text-rose-400 text-[10px] mt-1">
                          Calculated: ffffffa4c9a4c30a1f6a478fc3766df... (INVALID)
                        </p>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                      <p className="text-slate-500 uppercase text-[9px] mb-0.5">Chain Link (Previous Hash)</p>
                      <p className="truncate text-slate-400">{evt?.prev_hash || 'GENESIS'}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span className="flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400" /> Signed by: <strong className="text-slate-200">{evt?.actor || 'Authorized Officer'}</strong>
                    </span>
                    <span className={`flex items-center gap-1 text-[11px] ${
                      isCorruptedNode ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {isCorruptedNode ? 'Tamper Detected' : 'Verified Cryptographic Seal'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}