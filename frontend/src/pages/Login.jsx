import { useState } from 'react';
import { AlertCircle, Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const signIn = async (loginEmail, loginPassword) => {
    setError('');
    setIsSubmitting(true);
    try {
      const role = await login(loginEmail, loginPassword);
      // Route to role-specific dashboard or default officer overview
      navigate(role ? `/dashboard/${role}` : '/dashboard', { replace: true });
    } catch (caughtError) {
      setError(
        caughtError.message || 
        'Authentication failed. Please verify credentials or allow Render cold start.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    signIn(email, password);
  };

  const fillTestCredentials = () => {
    setEmail('test@test.com');
    setPassword('testpass123');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-7 shadow-2xl backdrop-blur-md sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-inner">
            <ShieldCheck aria-hidden="true" className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            SIH-DMS Portal
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Section 63 BSA Digital Evidence & Custody System
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address
            </label>
            <div className="relative mt-1.5">
              <Mail
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@test.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-600 outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 transition duration-150 hover:bg-cyan-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating with Render...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-slate-800 pt-5">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Development quick access
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TEST_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                disabled={isSubmitting}
                onClick={() => useTestRole(role)}
                className="rounded-md border border-slate-700 bg-slate-800 px-2 py-2 text-xs capitalize text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-60"
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}