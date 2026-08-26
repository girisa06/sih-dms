import { useState } from 'react';
import { AlertCircle, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const TEST_ROLES = ['officer', 'prosecutor', 'forensic_expert', 'judge', 'admin'];

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
      navigate(`/dashboard/${role}`, { replace: true });
    } catch (caughtError) {
      setError(caughtError.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    signIn(email, password);
  };

  const handleTestRole = (role) => {
    const testEmail = `${role}@sih.test`;
    setEmail(testEmail);
    setPassword('demo-password');
    signIn(testEmail, 'demo-password');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
            <ShieldCheck aria-hidden="true" className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl">
            Secure Digital Document Management System
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Legal evidence and chain-of-custody portal
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-300">
            Official email
            <span className="relative mt-2 block">
              <Mail
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="officer@sih.test"
                required
              />
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Password
            <span className="relative mt-2 block">
              <Lock
                aria-hidden="true"
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </span>
          </label>

          <button
            className="w-full rounded-lg bg-cyan-500 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
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
                onClick={() => handleTestRole(role)}
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