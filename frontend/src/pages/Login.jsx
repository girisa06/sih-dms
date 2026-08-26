import { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Loader2, 
  KeyRound, 
  Fingerprint, 
  Activity, 
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hexEntropy, setHexEntropy] = useState('0x7F8C...9B14');
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [cardTilt, setCardTilt] = useState({ rotateX: 0, rotateY: 0 });
  
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const { login } = useAuth();
  const navigate = useNavigate();

  // Dynamic Interactive Hex Mesh Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const hexRadius = 28;
    const hexHeight = Math.sqrt(3) * hexRadius;
    const side = (3 / 2) * hexRadius;

    const drawHex = (x, y, distToMouse) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + hexRadius * Math.cos(angle);
        const hy = y + hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();

      if (distToMouse < 200) {
        const alpha = (1 - distToMouse / 200) * 0.45;
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (distToMouse < 90) {
          ctx.fillStyle = `rgba(6, 182, 212, ${0.12 * (1 - distToMouse / 90)})`;
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / side) + 1;
      const rows = Math.ceil(canvas.height / hexHeight) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) { // ✅ Fixed: added 'let'
          const x = c * side;
          const y = r * hexHeight + (c % 2 === 1 ? hexHeight / 2 : 0);
          const dx = x - mousePosRef.current.x;
          const dy = y - mousePosRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          drawHex(x, y, dist);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
      const randomBlock = Math.floor(1000 + Math.random() * 9000);
      setHexEntropy(`0x${randomHex}...#${randomBlock}`);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    mousePosRef.current = { x: e.clientX, y: e.clientY };
    setMousePos({ x: e.clientX, y: e.clientY });

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * 4;
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 4;
      setCardTilt({ rotateX, rotateY });
    }
  };

  const handleMouseLeave = () => {
    setCardTilt({ rotateX: 0, rotateY: 0 });
    mousePosRef.current = { x: -1000, y: -1000 };
    setMousePos({ x: -1000, y: -1000 });
  };

  const signIn = async (loginEmail, loginPassword) => {
    setError('');
    setIsSubmitting(true);
    try {
      const role = await login(loginEmail, loginPassword);
      navigate(role ? `/dashboard/${role}` : '/dashboard', { replace: true });
    } catch (caughtError) {
      setError(
        caughtError.message || 
        'Authentication failed. Verify authority node or backend status.'
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
    <main 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen items-center justify-center bg-[#020617] p-4 text-slate-100 overflow-hidden select-none cursor-default font-sans"
    >
      <style>{`
        @keyframes laserScanAcross {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes streamFall {
          0% { transform: translateY(-100%); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(1000%); opacity: 0; }
        }
        .laser-sweep-line {
          animation: laserScanAcross 2.4s linear infinite;
        }
        .stream-1 { left: 10%; animation: streamFall 6s linear infinite; }
        .stream-2 { left: 28%; animation: streamFall 8s linear infinite 1s; }
        .stream-3 { left: 72%; animation: streamFall 7s linear infinite 2s; }
        .stream-4 { left: 88%; animation: streamFall 9s linear infinite 0.5s; }
      `}</style>

      {/* Hexagonal Interactive Canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0" />

      {/* Matrix Vertical Data Streams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30 z-0">
        <div className="stream-1 absolute top-0 h-40 w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
        <div className="stream-2 absolute top-0 h-56 w-[1px] bg-gradient-to-b from-transparent via-teal-300 to-transparent" />
        <div className="stream-3 absolute top-0 h-44 w-[1px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
        <div className="stream-4 absolute top-0 h-64 w-[1px] bg-gradient-to-b from-transparent via-teal-400 to-transparent" />
      </div>

      {/* 3D Perspective Terminal Box */}
      <div style={{ perspective: 1200 }} className="relative z-10 w-full max-w-[440px]">
        <section 
          ref={cardRef}
          style={{
            transform: `rotateX(${cardTilt.rotateX}deg) rotateY(${cardTilt.rotateY}deg)`,
            transition: 'transform 0.15s ease-out',
            boxShadow: '0 0 60px rgba(6,182,212,0.18), inset 0 0 20px rgba(6,182,212,0.05)'
          }}
          className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-slate-950/90 p-8 backdrop-blur-2xl"
        >
          {/* Laser Scanning Header */}
          <div className="laser-sweep-line pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* HUD Target Framing Brackets */}
          <div className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-cyan-400/80" />
          <div className="pointer-events-none absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-cyan-400/80" />
          <div className="pointer-events-none absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-cyan-400/80" />
          <div className="pointer-events-none absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-cyan-400/80" />

          {/* Portal Header */}
          <div className="mb-6 text-center">
            <div className="relative mx-auto mb-3.5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/50 bg-gradient-to-b from-cyan-500/20 to-slate-950 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.35)]">
              <ShieldCheck aria-hidden="true" className="h-9 w-9 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-cyan-500" />
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              SIH-DMS Portal
            </h1>
            <p className="mt-1 text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              Sec. 63 BSA Digital Evidence & Custody
            </p>
          </div>

          {/* Dynamic Telemetry Strip */}
          <div className="mb-5 flex items-center justify-between rounded-xl border border-cyan-500/30 bg-slate-900/90 px-3.5 py-2 font-mono text-[11px] text-slate-400 shadow-inner">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Activity className="w-3.5 h-3.5 animate-spin" /> TLS 1.3 / SHA-256
            </span>
            <span className="text-slate-400 font-mono">NODE: <strong className="text-cyan-300">{hexEntropy}</strong></span>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5 animate-bounce" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Terminal Identifier / Email
              </label>
              <div className="relative mt-1.5">
                <Mail
                  aria-hidden="true"
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80"
                />
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition duration-200 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.35)] focus:ring-1 focus:ring-cyan-400"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@tnpolice.gov.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Access Secret / Password
              </label>
              <div className="relative mt-1.5">
                <Lock
                  aria-hidden="true"
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80"
                />
                <input
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-slate-500 outline-none transition duration-200 focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.35)] focus:ring-1 focus:ring-cyan-400"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button
              className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 bg-[length:200%_auto] py-3 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all duration-300 hover:bg-[right_center] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Cryptographic Handshake...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800/80 pt-4">
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-widest text-slate-500 font-mono flex items-center justify-center gap-1.5">
              <Radio className="w-2.5 h-2.5 text-cyan-400 animate-ping" /> Pre-Seeded Authority Account
            </p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={fillTestCredentials}
              className="w-full rounded-xl border border-dashed border-cyan-500/30 bg-slate-900/60 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400 hover:bg-slate-900 hover:text-cyan-300 active:scale-95 cursor-pointer"
            >
              Inject Demo Credentials: <code className="text-cyan-400 font-mono">test@test.com</code>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}