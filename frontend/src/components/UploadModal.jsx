import React, { useEffect, useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const DOC_TYPES = [
  { value: 'fir', label: 'First Information Report (FIR)' },
  { value: 'chargesheet', label: 'Chargesheet' },
  { value: 'forensic_report', label: 'Forensic Lab Report' },
  { value: 'witness_statement', label: 'Witness Statement' },
  { value: 'court_filing', label: 'Court Filing' },
  { value: 'evidence', label: 'Digital Evidence / Annexure' },
];

export default function UploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('fir');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ocrPreview, setOcrPreview] = useState(null);
  const [error, setError] = useState('');
  const [cases, setCases] = useState([]);
  const [caseId, setCaseId] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadCases = async () => {
      try {
        const response = await axios.get('/cases');
        const availableCases = Array.isArray(response.data) ? response.data : [];
        setCases(availableCases);
        setCaseId(availableCases[0]?.id || '');
        if (availableCases.length === 0) {
          setError('Create a case before uploading a document.');
        }
      } catch (caughtError) {
        setCases([]);
        setCaseId('');
        setError(caughtError.response?.data?.detail || 'Unable to load available cases.');
      }
    };

    loadCases();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    if (!caseId) {
      setError('Select a valid case before uploading.');
      return;
    }

    setUploading(true);
    setProgress(20);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    try {
      const res = await axios.post(`/cases/${caseId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      const metadata = await axios.get(`/documents/${res.data.document_id}`);
      setOcrPreview({
        document_id: res.data.document_id,
        evidentiary_hash: metadata.data.evidentiary_hash,
        mime_type: metadata.data.mime_type,
        status: 'Encrypted and stored. AI processing is queued.',
      });
      setProgress(100);
    } catch (err) {
      setProgress(0);
      setError(err.response?.data?.detail || 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetAndClose = () => {
    setFile(null);
    setOcrPreview(null);
    setProgress(0);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative">
        <button onClick={handleResetAndClose} className="absolute right-4 top-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Upload Evidentiary Document</h2>
        <p className="text-xs text-slate-400 mb-6">Target Case: <span className="text-cyan-400 font-mono">{caseId}</span></p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!ocrPreview ? (
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Target Case
              </label>
              <select
                value={caseId}
                onChange={(event) => setCaseId(event.target.value)}
                disabled={cases.length === 0}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-400 outline-none disabled:opacity-50"
              >
                {cases.length === 0 ? (
                  <option value="">No accessible cases</option>
                ) : (
                  cases.map((caseItem) => (
                    <option key={caseItem.id} value={caseItem.id}>
                      {caseItem.case_number} — {caseItem.title}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Document Classification
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:border-cyan-400 outline-none"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-400/50 rounded-xl p-8 text-center cursor-pointer bg-slate-950/40 relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-200">
                {file ? file.name : "Select or drag legal document here"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 25MB (Encrypted in transit)</p>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Encrypting DEK & computing SHA-256...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button type="button" onClick={handleResetAndClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? 'Encrypting & Storing…' : 'Upload Document'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-2">
                <CheckCircle className="w-5 h-5" /> Document uploaded successfully
              </div>
              <p className="text-xs text-slate-400 mb-2">Live backend response:</p>
              <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 overflow-x-auto border border-slate-800">
                {JSON.stringify(ocrPreview, null, 2)}
              </pre>
            </div>
            <button
              onClick={handleResetAndClose}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition"
            >
              Finish & Return to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
