import React, { useState, useEffect } from 'react';
import {
  Share2,
  X,
  UserPlus,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Calendar
} from 'lucide-react';

// --- FALLBACK MOCK DATA ---
// Aligned with the 'case_access' and 'users' schema specifications
const MOCK_SHARED_USERS = [
  {
    id: "acc-1",
    case_id: "c101",
    user_id: "u-302",
    user_name: "Adv. Meera Nair",
    user_role: "prosecutor",
    granted_by: "Insp. Rajesh Kumar",
    expires_at: "2026-08-30T18:00:00Z" // Future date: Active
  },
  {
    id: "acc-2",
    case_id: "c101",
    user_id: "u-405",
    user_name: "Dr. A. Sharma",
    user_role: "forensic_expert",
    granted_by: "Insp. Rajesh Kumar",
    expires_at: "2026-08-24T12:00:00Z" // Past date: Expired
  }
];

// Target User Dropdown Options based on RBAC Roles
const AVAILABLE_USERS = [
  { id: "u-302", name: "Adv. Meera Nair", role: "prosecutor" },
  { id: "u-405", name: "Dr. A. Sharma", role: "forensic_expert" },
  { id: "u-501", name: "Judge H. R. Deshmukh", role: "judge" },
  { id: "u-109", name: "Sub-Insp. Vikram Singh", role: "officer" }
];

export default function SharingAccessModal({ caseId = "c101", isOpen, onClose }) {
  const [sharedList, setSharedList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [now, setNow] = useState(new Date());

  // Real-time counter interval to update remaining access durations
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active access list
  useEffect(() => {
    if (!isOpen || !caseId) return;

    async function fetchAccessList() {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`/cases/${caseId}/access`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        setSharedList(data);
        setIsMock(false);
      } catch (err) {
        console.warn("Access endpoint unreachable. Falling back to local mock state.", err);
        setSharedList(MOCK_SHARED_USERS);
        setIsMock(true);
      }
    }

    fetchAccessList();
  }, [caseId, isOpen]);

  if (!isOpen) return null;

  // --- GRANT ACCESS ACTION ---
  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !expirationDate) {
      setError("Please select both a target user and an expiration date/time.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      user_id: selectedUserId,
      expires_at: new Date(expirationDate).toISOString()
    };

    try {
      const token = localStorage.getItem('jwt_token');
      // Interacts with Person 1's POST /cases/{id}/access endpoint[cite: 1, 2]
      const response = await fetch(`/cases/${caseId}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to grant access (Status: ${response.status})`);
      }

      const newAccess = await response.json();
      setSharedList((prev) => [newAccess, ...prev]);
      setSelectedUserId('');
      setExpirationDate('');
    } catch (err) {
      console.warn("Backend unavailable. Executing mock access grant.", err);
      // Fallback local update for offline UI testing[cite: 1, 2]
      const targetUser = AVAILABLE_USERS.find(u => u.id === selectedUserId);
      const mockEntry = {
        id: `acc-${Date.now()}`,
        case_id: caseId,
        user_id: selectedUserId,
        user_name: targetUser?.name || selectedUserId,
        user_role: targetUser?.role || "officer",
        granted_by: "Current User",
        expires_at: new Date(expirationDate).toISOString()
      };
      setSharedList((prev) => [mockEntry, ...prev]);
      setSelectedUserId('');
      setExpirationDate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 sm:p-6">
      <div className="flex flex-col w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden text-slate-100">
        
        {/* --- MODAL HEADER --- */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Time-Bound Case Sharing</h2>
              <p className="text-xs text-slate-400">Grant and manage temporal RBAC permissions[cite: 1, 2]</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mock Data Banner Notice */}
        {isMock && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-400 flex items-center justify-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Using fallback local mock data for sharing controls[cite: 1, 2].</span>
          </div>
        )}

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* --- GRANT NEW ACCESS FORM --- */}
          <form onSubmit={handleGrantAccess} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-blue-400" /> Grant Time-Bound Access
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Target User */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Target User (user_id)[cite: 1, 2]
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">-- Select Personnel --</option>
                  {AVAILABLE_USERS.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Expiration Date/Time */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Access Expiration (expires_at)[cite: 1, 2]
                </label>
                <input
                  type="datetime-local"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-medium">{error}</p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                Grant Access
              </button>
            </div>
          </form>

          {/* --- ACTIVE SHARED USERS LIST --- */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Authorized Personnel & Expiration Status[cite: 1, 2]
            </h3>

            {sharedList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No external access granted for this case file yet.
              </div>
            ) : (
              <div className="space-y-3">
                {sharedList.map((item) => {
                  const expiration = new Date(item.expires_at);
                  const isExpired = now > expiration; // Check if expires_at is past current timestamp[cite: 1, 2]

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isExpired
                          ? 'bg-rose-950/10 border-rose-500/30'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {/* User Info */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-200">
                            {item.user_name || item.user_id}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.user_role || 'user'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span>Granted by: <strong className="text-slate-300">{item.granted_by}</strong></span>
                        </div>
                      </div>

                      {/* Expiration Status & Remaining Duration Counter */}
                      <div className="flex items-center space-x-3">
                        {isExpired ? (
                          // Explicit Expired Visual Badge[cite: 1, 2]
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-in fade-in duration-200">
                            <AlertCircle className="w-3.5 h-3.5 mr-1" /> EXPIRED[cite: 1, 2]
                          </span>
                        ) : (
                          // Active State with Remaining Counter[cite: 1, 2]
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                            </span>
                            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center justify-end">
                              <Clock className="w-3 h-3 mr-1 text-slate-500" />
                              <CountdownTimer targetDate={expiration} now={now} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

// --- HELPER COUNTDOWN TIMER COMPONENT ---
function CountdownTimer({ targetDate, now }) {
  const diff = Math.max(0, targetDate - now);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return (
    <span>
      Remaining: {hours}h {minutes}m {seconds}s
    </span>
  );
}