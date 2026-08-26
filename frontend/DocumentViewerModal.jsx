import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Lock,
  AlertTriangle,
  Loader2,
  FileText,
  ShieldAlert,
  Eye,
  FileCheck
} from 'lucide-react';

export default function DocumentViewerModal({ documentId, isOpen, onClose }) {
  const [metadata, setMetadata] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { type: '403' | '404' | '500', message: string }
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    if (!isOpen || !documentId) return;

    let isMounted = true;
    let createdUrl = null;

    const fetchDocumentData = async () => {
      setLoading(true);
      setError(null);
      setZoomLevel(100);

      try {
        const token = localStorage.getItem('jwt_token');
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch metadata from Person 1's API
        const metaRes = await fetch(`/documents/${documentId}`, {
          headers: authHeaders
        });

        if (metaRes.status === 403) {
          throw { type: '403', message: 'Access Denied: You lack active permissions or your access window has expired.' };
        }
        if (!metaRes.ok) {
          throw { type: 'FETCH_ERROR', message: `Failed to retrieve metadata (Status: ${metaRes.status})` };
        }

        const metaData = await metaRes.json();
        if (!isMounted) return;
        setMetadata(metaData);

        // 2. Fetch decrypted file stream from Person 2's API
        const fileRes = await fetch(`/documents/${documentId}/download`, {
          headers: authHeaders
        });

        if (fileRes.status === 403) {
          throw { type: '403', message: 'Security Block: You do not have authorization to view or decrypt this stream.' };
        }
        if (!fileRes.ok) {
          throw { type: 'FETCH_ERROR', message: `Failed to stream file payload (Status: ${fileRes.status})` };
        }

        const fileBlob = await fileRes.blob();
        if (!isMounted) return;

        // Create secure object URL from stream
        createdUrl = URL.createObjectURL(fileBlob);
        setBlobUrl(createdUrl);
      } catch (err) {
        if (!isMounted) return;
        if (err.type) {
          setError(err);
        } else {
          setError({ type: '500', message: 'An unexpected network error occurred while decrypting the document stream.' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDocumentData();

    // Revoke Blob URL on unmount/close to release browser memory resources
    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [documentId, isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  const handleDownload = () => {
    if (!blobUrl || !metadata) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${metadata.doc_type || 'document'}_${metadata.id || 'download'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isPDF = metadata?.mime_type === 'application/pdf';
  const isImage = metadata?.mime_type?.startsWith('image/');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="flex flex-col w-full max-w-5xl h-[90vh] bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        
        {/* --- MODAL HEADER & CONTROLS --- */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 text-white shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden mr-4">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
              <FileText className="w-5 h-5 shrink-0" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold truncate text-slate-100">
                  {metadata ? `Document #${metadata.id}` : 'Loading document metadata...'}
                </h3>
                {metadata?.doc_type && (
                  <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {metadata.doc_type}
                  </span>
                )}
              </div>
              {metadata?.evidentiary_hash && (
                <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md">
                  SHA256: {metadata.evidentiary_hash}
                </p>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Zoom Controls (Active for Images and Native Viewers) */}
            {isImage && (
              <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 mr-2">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 50 || loading || error}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white disabled:opacity-40 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono px-2 text-slate-300 min-w-[3rem] text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 200 || loading || error}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white disabled:opacity-40 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  disabled={zoomLevel === 100 || loading || error}
                  className="p-1.5 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white disabled:opacity-40 transition"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || !!error || !blobUrl}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition ml-2"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- MAIN PREVIEW CONTAINER --- */}
        <div className="relative flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-4">
          
          {/* 1. Loading Indicator State */}
          {loading && (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-slate-200">Decrypting & Streaming Document...</p>
                <p className="text-xs text-slate-500">Executing envelope decryption via security module</p>
              </div>
            </div>
          )}

          {/* 2. Permission Denied & Error States */}
          {!loading && error && (
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
              {error.type === '403' ? (
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              
              <h4 className="text-base font-bold text-slate-100 mb-1">
                {error.type === '403' ? 'Access Restricted' : 'Unable to Display Document'}
              </h4>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                {error.message}
              </p>
              
              <button
                onClick={onClose}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                Return to Case File
              </button>
            </div>
          )}

          {/* 3. Successful Preview State */}
          {!loading && !error && blobUrl && (
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              
              {/* Image Preview Rendering */}
              {isImage && (
                <div className="transition-transform duration-200 flex items-center justify-center min-h-full">
                  <img
                    src={blobUrl}
                    alt={metadata?.doc_type || 'Evidence Image Preview'}
                    style={{ transform: `scale(${zoomLevel / 100})` }}
                    className="max-w-full max-h-[75vh] object-contain rounded shadow-lg border border-slate-800 transition-all"
                  />
                </div>
              )}

              {/* PDF Preview Rendering */}
              {isPDF && (
                <iframe
                  src={`${blobUrl}#toolbar=0`}
                  title="PDF Preview"
                  className="w-full h-full rounded border-0 bg-white shadow-inner"
                />
              )}

              {/* Unsupported Mime Types Fallback */}
              {!isPDF && !isImage && (
                <div className="text-center bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm">
                  <FileCheck className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-200 mb-1">Preview Unavailable</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Direct browser preview is not available for standard previewing of format: <code className="text-blue-400 font-mono">{metadata?.mime_type}</code>
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download File Instead
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* --- FOOTER STATUS BAR --- */}
        <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 font-mono">
          <div className="flex items-center space-x-4">
            <span>MIME: <span className="text-slate-200">{metadata?.mime_type || 'Unknown'}</span></span>
            {metadata?.version && <span>Version: <span className="text-slate-200">v{metadata.version}</span></span>}
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
            <Eye className="w-3.5 h-3.5" /> Direct Memory Stream (Decrypted)
          </div>
        </div>

      </div>
    </div>
  );
}