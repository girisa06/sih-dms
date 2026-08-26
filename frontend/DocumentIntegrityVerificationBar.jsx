import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileBadge,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api-proxy';

export default function DocumentIntegrityVerificationBar({ documentId = "doc-101", onVerificationComplete }) {
  // Verification states: 'IDLE' | 'VERIFYING' | 'PASS' | 'FAIL'
  const [verifyState, setVerifyState] = useState('IDLE');
  const [verifyDetails, setVerifyDetails] = useState(null);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certError, setCertError] = useState(null);

  // --- 1. VERIFY INTEGRITY ACTION ---
  const handleVerifyIntegrity = async () => {
    setVerifyState('VERIFYING');
    setVerifyDetails(null);

    try {
      const token = localStorage.getItem('token');
      // Calls Person 2's POST /documents/{id}/verify endpoint
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Verification endpoint failed with status ${response.status}`);
      }

      const data = await response.json(); 
      if (data.valid) {
        setVerifyState('PASS');
      } else {
        setVerifyState('FAIL');
      }
      setVerifyDetails(data);

      if (onVerificationComplete) {
        onVerificationComplete(data.valid, data);
      }
    } catch (err) {
      console.warn("Backend verification unavailable.", err);
      setVerifyState('FAIL');
      setVerifyDetails({ message: "Unable to verify the document integrity." });
    }
  };

  // --- 2. GENERATE BSA SEC 63 CERTIFICATE ACTION ---
  const handleGenerateCertificate = async () => {
    setGeneratingCert(true);
    setCertError(null);

    try {
      const token = localStorage.getItem('token');
      // Calls Person 2's POST /documents/{id}/certificate endpoint[cite: 1, 2]
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}/certificate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to generate certificate (Status: ${response.status})`);
      }

      const certBlob = await response.blob();
      const url = URL.createObjectURL(certBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Section63_Admissibility_Cert_${documentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Certificate endpoint failed. Falling back to local trigger notice.", err);
      setCertError("Unable to reach certificate generation service.");
    } finally {
      setGeneratingCert(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 text-slate-900 mb-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Status Summary Block */}
        <div className="flex items-center space-x-3.5">
          {verifyState === 'IDLE' && (
            <div className="p-3 bg-slate-100 text-slate-500 rounded-xl border border-slate-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
          )}

          {verifyState === 'VERIFYING' && (
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {verifyState === 'PASS' && (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200 animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}

          {verifyState === 'FAIL' && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-200 animate-in zoom-in-95 duration-150">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Cryptographic Integrity Engine</h3>
              
              {/* STATUS BADGE PROMPTS */}
              {verifyState === 'PASS' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  PASS: CHAIN INTACT
                </span>
              )}

              {verifyState === 'FAIL' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/30 animate-pulse">
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  FAIL: TAMPER DETECTED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {verifyState === 'IDLE' && "Execute SHA-256 hash-chain verification to validate evidence admissibility."}
              {verifyState === 'VERIFYING' && "Recomputing hash ledger against master key..."}
              {verifyState === 'PASS' && (verifyDetails?.message || "Cryptographic audit trail intact and verified.")}
              {verifyState === 'FAIL' && (verifyDetails?.message || "Hash mismatch detected! Chain integrity broken.")}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:shrink-0">
          
          {/* Main "Verify Integrity" Button */}
          <button
            onClick={handleVerifyIntegrity}
            disabled={verifyState === 'VERIFYING'}
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow-sm ${
              verifyState === 'FAIL'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {verifyState === 'VERIFYING' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
              </>
            ) : verifyState === 'IDLE' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verify Integrity[cite: 2]
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Re-Verify
              </>
            )}
          </button>

          {/* Secondary "Generate BSA Sec 63 Certificate" Button */}
          <button
            onClick={handleGenerateCertificate}
            disabled={generatingCert || verifyState === 'FAIL'}
            title={verifyState === 'FAIL' ? "Certificate generation disabled due to failed tamper-check" : ""}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition flex items-center gap-2 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingCert ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Generating...
              </>
            ) : (
              <>
                <FileBadge className="w-4 h-4 text-blue-600" />
                <span>Generate BSA Sec 63 Certificate[cite: 1, 2]</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* FAIL WARNING CONTAINER */}
      {verifyState === 'FAIL' && (
        <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 flex items-start gap-3 animate-in fade-in duration-200">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Court Evidence Warning:</span> This document failed hash chain validation. The stored hash does not match the computed hash of the current payload[cite: 1, 2]. Admissibility certificates cannot be issued for tampered assets[cite: 1, 2].
          </div>
        </div>
      )}

      {/* ERROR NOTICE */}
      {certError && (
        <div className="mt-2 text-right text-[11px] text-rose-500 font-medium">
          {certError}
        </div>
      )}

    </div>
  );
}