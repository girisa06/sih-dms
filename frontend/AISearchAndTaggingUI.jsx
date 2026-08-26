import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Tag,
  FileText,
  Filter,
  User,
  Calendar,
  Hash,
  BookOpen,
  Loader2,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

// --- FALLBACK MOCK DATA (Aligned with Person 3's Search & Classification Contract) ---
const MOCK_SEARCH_RESULTS = [
  {
    id: "doc-101",
    case_id: "c101",
    title: "First Information Report - Crime No. 402/2026",
    classification: "FIR",
    ocr_text_snippet: "...The accused person, identified as Suresh Kumar, was intercepted near the highway checkpoint. Relevant sections under IPC 302 and 379 were registered immediately by the investigating officer...",
    entities: {
      case_no: ["CR-402/2026"],
      sections: ["IPC 302", "IPC 379"],
      names: ["Suresh Kumar", "Insp. Rajesh Kumar"],
      dates: ["2026-08-15"]
    }
  },
  {
    id: "doc-102",
    case_id: "c101",
    title: "Forensic Chemical Analysis & Toxicology Report",
    classification: "Forensic Report",
    ocr_text_snippet: "...Chemical examination of sample A-1 revealed traces of toxic compounds. Verified by Senior Analyst Dr. A. Sharma on August 18, 2026. The findings correlate with physical evidence...",
    entities: {
      case_no: ["CR-402/2026", "LAB-9982"],
      sections: ["Sec 45 BSA"],
      names: ["Dr. A. Sharma"],
      dates: ["2026-08-18"]
    }
  },
  {
    id: "doc-103",
    case_id: "c102",
    title: "Witness Deposition Statement - Meera Nair",
    classification: "Deposition",
    ocr_text_snippet: "...Adv. Meera Nair submitted the formal witness statement regarding the timeline on August 20, 2026. Clarifications were requested under Evidence Act Sec 63...",
    entities: {
      case_no: ["CR-511/2026"],
      sections: ["Sec 63 BSA", "IPC 120B"],
      names: ["Adv. Meera Nair", "Vikram Singh"],
      dates: ["2026-08-20"]
    }
  }
];

export default function AISearchAndTaggingUI({ onSelectDocument }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);

  // Active Dynamic Filters
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [selectedEntityType, setSelectedEntityType] = useState('ALL');

  // --- 1. DEBOUNCE TRIGGER (300ms) ---[cite: 2]
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- 2. FETCH SEARCH RESULTS FROM PERSON 3'S API ---
  useEffect(() => {
    async function executeSearch() {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        // Calls Person 3's GET /search?q= endpoint[cite: 1, 2]
        const response = await fetch(`/search?q=${encodeURIComponent(debouncedQuery)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const data = await response.json();
        setResults(data);
        setIsMock(false);
      } catch (err) {
        console.warn("Search endpoint unreachable. Using mock AI search dataset.", err);
        // Fallback filtering over mock data[cite: 1, 2]
        if (!debouncedQuery.trim()) {
          setResults(MOCK_SEARCH_RESULTS);
        } else {
          const q = debouncedQuery.toLowerCase();
          const filtered = MOCK_SEARCH_RESULTS.filter(doc =>
            doc.title.toLowerCase().includes(q) ||
            doc.ocr_text_snippet.toLowerCase().includes(q) ||
            doc.classification.toLowerCase().includes(q) ||
            Object.values(doc.entities).flat().some(val => val.toLowerCase().includes(q))
          );
          setResults(filtered);
        }
        setIsMock(true);
      } finally {
        setLoading(false);
      }
    }

    executeSearch();
  }, [debouncedQuery]);

  // --- 3. DYNAMIC FILTER COMPUTATIONS ---[cite: 2]
  const availableClassifications = useMemo(() => {
    const set = new Set(results.map(r => r.classification));
    return ['ALL', ...Array.from(set)];
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter(doc => {
      // Classification filter
      if (selectedClassification !== 'ALL' && doc.classification !== selectedClassification) {
        return false;
      }
      // Entity Type filter
      if (selectedEntityType !== 'ALL') {
        const hasEntity = doc.entities[selectedEntityType] && doc.entities[selectedEntityType].length > 0;
        if (!hasEntity) return false;
      }
      return true;
    });
  }, [results, selectedClassification, selectedEntityType]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-xl max-w-5xl mx-auto">
      
      {/* --- HEADER & SEARCH BAR --- */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">AI Neural Document Search & Entity Tagging</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Instant debounced query extraction across OCR text, document types, and legal entities.[cite: 2]
        </p>

        {/* Global Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by keyword, case number, penal code, or entity name..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* --- DYNAMIC FILTER BAR --- */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> Dynamic Filters:[cite: 2]
          </span>

          {/* Classification Filter Dropdown */}
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Classifications</option>
            {availableClassifications.filter(c => c !== 'ALL').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Entity Type Filter Dropdown */}
          <select
            value={selectedEntityType}
            onChange={(e) => setSelectedEntityType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Entity Types</option>
            <option value="case_no">Contains Case No.</option>
            <option value="sections">Contains Legal Sections</option>
            <option value="names">Contains Named Entities</option>
            <option value="dates">Contains Dates</option>
          </select>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing <strong>{filteredResults.length}</strong> of <strong>{results.length}</strong> documents
        </div>
      </div>

      {/* --- SEARCH RESULTS LIST --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-7 h-7 animate-spin text-blue-400 mb-2" />
          <span className="text-xs text-slate-400">Executing Neural AI Entity Extraction...</span>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
          No matching documents found for query or filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument && onSelectDocument(doc.id)}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition cursor-pointer group space-y-3"
            >
              {/* Document Header & Classification Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-5 h-5 text-blue-400 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition">
                    {doc.title}
                  </h3>
                </div>

                {/* Auto-Classification Badge */}
                <ClassificationBadge type={doc.classification} />
              </div>

              {/* Matched OCR Text Snippet */}
              <p className="text-xs text-slate-300 font-sans leading-relaxed pl-7 border-l-2 border-slate-800 group-hover:border-blue-500/50 transition">
                {doc.ocr_text_snippet}
              </p>

              {/* --- EXTRACTED ENTITY CHIPS SECTION --- */}
              <div className="pt-2 flex flex-wrap items-center gap-2 pl-7 text-xs">
                {/* Case Numbers */}
                {doc.entities?.case_no?.map((item, idx) => (
                  <EntityChip key={`case-${idx}`} icon={Hash} label={item} color="bg-purple-500/10 text-purple-300 border-purple-500/30" />
                ))}

                {/* Legal Sections */}
                {doc.entities?.sections?.map((item, idx) => (
                  <EntityChip key={`sec-${idx}`} icon={BookOpen} label={item} color="bg-amber-500/10 text-amber-300 border-amber-500/30" />
                ))}

                {/* Named Entities */}
                {doc.entities?.names?.map((item, idx) => (
                  <EntityChip key={`name-${idx}`} icon={User} label={item} color="bg-blue-500/10 text-blue-300 border-blue-500/30" />
                ))}

                {/* Dates */}
                {doc.entities?.dates?.map((item, idx) => (
                  <EntityChip key={`date-${idx}`} icon={Calendar} label={item} color="bg-emerald-500/10 text-emerald-300 border-emerald-500/30" />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// --- HELPER COMPONENTS ---

function ClassificationBadge({ type }) {
  const badgeStyles = {
    FIR: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    "Forensic Report": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Deposition: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "Evidence Log": "bg-amber-500/10 text-amber-400 border-amber-500/30"
  };

  const style = badgeStyles[type] || "bg-slate-800 text-slate-300 border-slate-700";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider shrink-0 ${style}`}>
      {type}
    </span>
  );
}

function EntityChip({ icon: Icon, label, color }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${color}`}>
      <Icon className="w-3 h-3 mr-1 opacity-70" />
      {label}
    </span>
  );
}