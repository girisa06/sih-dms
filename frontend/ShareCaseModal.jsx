import React, { useState } from 'react';
import { Share2, Copy, CheckCircle2, X } from 'lucide-react';

export default function ShareCaseModal({ isOpen, onClose, caseId = 'CASE-2026-001' }) {
  const [expiryHours, setExpiryHours] = useState('24');
  const [recipientRole, setRecipientRole] = useState('prosecutor');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateLink = (e) => {
    e.preventDefault();
    const token = Math.random().toString(36).substring(2, 15);
    const link = `https://dms.gov.in/vault/access?case=${caseId}&token=${token}&expires_in=${expiryHours}h`;
    setGeneratedLink(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400 mb-1">
          <Share2 className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">Time-Bound Case Access</h3>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Generate encrypted temporary read link for <span className="text-cyan-300 font-mono">{caseId}</span>
        </p>

        {!generatedLink ? (
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Recipient Category</label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400"
              >
                <option value="prosecutor">Public Prosecutor / Legal Counsel</option>
                <option value="forensic_expert">External Forensic Lab Analyst</option>
                <option value="judge">Judicial Bench / Magistrate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Link Expiration Limit (case_access.expires_at)</label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-400"
              >
                <option value="12">12 Hours (Urgent Motion)</option>
                <option value="24">24 Hours (Standard Hearing)</option>
                <option value="72">72 Hours (Trial Session)</option>
                <option value="168">7 Days (Extended Investigation)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-400 hover:text-white">Cancel</button>
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-xs">
                Generate Secure Token Link
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Encrypted Expiring URL:</p>
              <p className="text-xs font-mono text-cyan-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                {generatedLink}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Access Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}