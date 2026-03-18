import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bike, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('✅ Cuenta creada. Revisa tu correo para confirmar.');
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-neon-green)] opacity-[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-neon-blue)] opacity-[0.03] blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[var(--color-neon-green)] rounded-2xl flex justify-center items-center mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,128,0.3)]">
            <Bike className="text-black" size={36} />
          </div>
          <h1 className="text-white font-bold tracking-widest text-3xl">MOTOHUB</h1>
          <span className="text-[var(--color-neon-green)] text-[10px] uppercase font-bold tracking-[0.3em]">PREMIUM</span>
        </div>

        {/* Card */}
        <div className="glass-card p-8 premium-border">
          <div className="premium-border-inner p-8">
            <h2 className="text-2xl font-industrial font-bold italic text-white uppercase tracking-tighter mb-2">
              {isSignUp ? 'CREAR_CUENTA' : 'INICIAR_SESIÓN'}
            </h2>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-mono tracking-[0.3em] uppercase mb-8">
              {isSignUp ? 'REGISTRO // NUEVO_OPERADOR' : 'ACCESO // PROTOCOLO_SEGURO'}
            </p>

            {/* Error / Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-[var(--color-neon-orange)]/10 border border-[var(--color-neon-orange)]/30 rounded-xl flex items-center gap-3">
                <AlertCircle size={16} className="text-[var(--color-neon-orange)] shrink-0" />
                <span className="text-[var(--color-neon-orange)] text-xs font-mono">{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-6 p-4 bg-[var(--color-neon-green)]/10 border border-[var(--color-neon-green)]/30 rounded-xl">
                <span className="text-[var(--color-neon-green)] text-xs font-mono">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2 tracking-widest">EMAIL_OPERADOR</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-bold focus:border-[var(--color-neon-green)] focus:outline-none transition-colors"
                    placeholder="operador@motohub.co"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase block mb-2 tracking-widest">CONTRASEÑA_ACCESO</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white font-bold focus:border-[var(--color-neon-green)] focus:outline-none transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[var(--color-neon-green)] text-black font-bold rounded-xl uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-[var(--shadow-neon)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESANDO...' : isSignUp ? 'REGISTRAR_OPERADOR' : 'ACCEDER_AL_SISTEMA'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-[9px] text-[var(--color-text-secondary)] font-mono uppercase tracking-widest">O</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Toggle */}
            <div className="text-center mt-6">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMsg(''); }}
                className="text-[var(--color-text-secondary)] text-xs font-mono hover:text-[var(--color-neon-green)] transition-colors uppercase tracking-widest"
              >
                {isSignUp ? '¿YA TIENES CUENTA? INICIA_SESIÓN' : '¿NUEVO? CREAR_CUENTA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
