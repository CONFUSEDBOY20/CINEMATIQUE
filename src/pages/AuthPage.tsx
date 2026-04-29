import React, { useState, useId } from 'react';
import { useAppContext } from '../context/AppContext';
import {
  Mail, Lock, User, ArrowRight, Film,
  Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Mode = 'login' | 'register' | 'admin' | 'forgot' | 'reset';

interface FieldError {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  form?: string;
}

export function AuthPage() {
  const { login, register, navigate, forgotPassword, resetPassword, signInWithGoogle } = useAppContext();
  const id = useId();

  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [success, setSuccess] = useState('');

  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken]           = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const clearErrors = () => setErrors({});

  const switchMode = (m: Mode) => {
    setMode(m);
    clearErrors();
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
    setShowPassword(false);
    setShowConfirm(false);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FieldError = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register' && !name.trim()) {
      e.name = 'Full name is required';
    }
    if (!email) {
      e.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      e.email = 'Enter a valid email address';
    }
    if (!password) {
      e.password = 'Password is required';
    } else if (mode === 'register' && password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (mode === 'register' && password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (mode === 'forgot') {
      if (!email) { setErrors({ email: 'Email is required' }); return; }
      setLoading(true);
      const res = await forgotPassword(email);
      setLoading(false);
      if (res.ok) setSuccess('Check your console for the reset token (Demo Mode)');
      else setErrors({ form: res.error });
      return;
    }

    if (mode === 'reset') {
      if (!resetToken || !password) { setErrors({ form: 'All fields required' }); return; }
      setLoading(true);
      const res = await resetPassword(resetToken, password);
      setLoading(false);
      if (res.ok) { setSuccess('Password reset! Please log in.'); setMode('login'); }
      else setErrors({ form: res.error });
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'register') {
        const result = await register(name.trim(), email.trim(), password);
        if (!result.ok) {
          setErrors({ form: result.error });
        } else {
          navigate('home');
        }
      } else {
        const result = await login(email.trim(), password);
        if (!result.ok) {
          setErrors({ form: result.error });
        } else {
          navigate('home');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);
    if (!result.ok) setErrors({ form: result.error });
  };

  const isRegister = mode === 'register';
  const isAdmin    = mode === 'admin';

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-brand-black/85 backdrop-blur-sm" />
      </div>

      {/* Back to Home Button */}
      <button 
        onClick={() => navigate('home')}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/10 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors text-xs font-bold uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border border-brand-gold flex items-center justify-center mx-auto mb-4">
            <div className="w-full h-full bg-brand-black rounded-full flex items-center justify-center text-brand-gold">
              {isAdmin ? <ShieldAlert className="w-6 h-6 text-brand-crimson" /> : <Film className="w-6 h-6" />}
            </div>
          </div>
          <div className="text-4xl font-bold tracking-tighter text-brand-gold font-serif mb-1">
            CINE<span className="text-white">MATIQUE</span>
          </div>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-medium">
            {isRegister ? 'Create your account' : isAdmin ? 'Admin portal' : mode === 'forgot' ? 'Recover Account' : mode === 'reset' ? 'Set New Password' : 'Premium Experience'}
          </p>
        </div>

        {/* Mode Tabs — only for non-admin */}
        <AnimatePresence mode="wait">
          {!isAdmin && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex bg-white/5 border border-white/10 p-1 rounded-full mb-7"
            >
              <TabBtn active={!isRegister} onClick={() => switchMode('login')}>Sign In</TabBtn>
              <TabBtn active={isRegister}  onClick={() => switchMode('register')}>Create Account</TabBtn>
            </motion.div>
          )}
          {isAdmin && (
            <motion.div
              key="admin-tabs"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex bg-brand-crimson/10 border border-brand-crimson/30 p-1 rounded-full mb-7"
            >
              <div className="flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-full text-center text-brand-crimson bg-brand-crimson/20">
                Admin Login
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Name — register only */}
            {isRegister && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FieldLabel htmlFor={`${id}-name`} error={errors.name}>Full Name</FieldLabel>
                <InputWrapper icon={<User className="w-4 h-4" />} error={!!errors.name}>
                  <input
                    id={`${id}-name`}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </InputWrapper>
                <FieldError msg={errors.name} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <FieldLabel htmlFor={`${id}-email`} error={errors.email}>Email Address</FieldLabel>
            <InputWrapper icon={<Mail className="w-4 h-4" />} error={!!errors.email} accent={isAdmin ? 'crimson' : 'gold'}>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder={isAdmin ? 'admin@cinematique.com' : 'you@domain.com'}
                className={inputClass}
              />
            </InputWrapper>
            <FieldError msg={errors.email} />
          </div>

          {/* Password */}
          <div>
            <FieldLabel htmlFor={`${id}-pass`} error={errors.password}>
              {isAdmin ? 'Admin Password' : 'Password'}
            </FieldLabel>
            <InputWrapper
              icon={<Lock className="w-4 h-4" />}
              error={!!errors.password}
              accent={isAdmin ? 'crimson' : 'gold'}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="text-white/30 hover:text-white/70 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            >
              <input
                id={`${id}-pass`}
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                placeholder="••••••••"
                className={inputClass}
              />
            </InputWrapper>
            <FieldError msg={errors.password} />
            {!isRegister && !isAdmin && mode === 'login' && (
              <div className="flex justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => switchMode('forgot')}
                  className="text-[10px] text-brand-gold hover:text-white uppercase font-bold tracking-widest transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {/* Reset Token — reset mode only */}
          <AnimatePresence mode="popLayout">
            {mode === 'reset' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <FieldLabel htmlFor="token">Reset Token</FieldLabel>
                <InputWrapper icon={<ShieldAlert className="w-4 h-4" />}>
                  <input
                    id="token"
                    type="text"
                    value={resetToken}
                    onChange={e => setResetToken(e.target.value)}
                    placeholder="Enter token from console"
                    className={inputClass}
                  />
                </InputWrapper>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {/* Confirm Password — register only */}
            {isRegister && (
              <motion.div
                key="confirm-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FieldLabel htmlFor={`${id}-confirm`} error={errors.confirmPassword}>Confirm Password</FieldLabel>
                <InputWrapper
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  error={!!errors.confirmPassword}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="text-white/30 hover:text-white/70 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                >
                  <input
                    id={`${id}-confirm`}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: undefined })); }}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </InputWrapper>
                <FieldError msg={errors.confirmPassword} />
              </motion.div>
            )}

            {/* Admin info notice */}
            {isAdmin && (
              <motion.div
                key="admin-notice"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-brand-crimson/10 border border-brand-crimson/20 rounded-2xl px-4 py-3"
              >
                <p className="text-[10px] font-bold text-brand-crimson uppercase tracking-widest mb-1">Admin Portal</p>
                <p className="text-xs text-white/50">Sign in with your admin email and password. Access is verified server-side.</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form-level error / success */}
          <AnimatePresence>
            {errors.form && (
              <motion.div
                key="form-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{errors.form}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                key="form-success"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-green-300 text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 mt-2 disabled:opacity-60 disabled:cursor-not-allowed
              ${isAdmin
                ? 'bg-brand-crimson hover:bg-red-700 text-white shadow-[0_0_20px_rgba(229,9,20,0.3)]'
                : 'bg-brand-gold text-brand-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.3)]'
              }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === 'forgot' ? 'Send Reset Link' : mode === 'reset' ? 'Reset Password' : isRegister ? 'Create Account' : isAdmin ? 'Access Admin' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Google Login — only for member login/register */}
          {!isAdmin && (mode === 'login' || mode === 'register') && (
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">OR</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 bg-white text-brand-black rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all border border-white/10"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>
            </div>
          )}
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-3">
          {!isAdmin && (
            <p className="text-[11px] uppercase tracking-widest text-white/40 font-bold">
              {isRegister ? (
                <>Already have an account?{' '}
                  <button id="switch-to-login" onClick={() => switchMode('login')} className="text-brand-gold hover:text-white transition-colors ml-1">
                    Sign In
                  </button>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <button id="switch-to-register" onClick={() => switchMode('register')} className="text-brand-gold hover:text-white transition-colors ml-1">
                    Register Now
                  </button>
                </>
              )}
            </p>
          )}

          <button
            id="toggle-admin-mode"
            onClick={() => {
              if (mode === 'forgot' || mode === 'reset') setMode('login');
              else switchMode(isAdmin ? 'login' : 'admin');
            }}
            className="text-[10px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors font-bold"
          >
            {mode === 'forgot' || mode === 'reset' ? '← Back to Login' : isAdmin ? '← Back to Member Login' : 'Admin Access'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const inputClass =
  "w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none";

function FieldLabel({ htmlFor, children, error }: { htmlFor: string; children: React.ReactNode; error?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-2 transition-colors ${error ? 'text-red-400' : 'text-white/40'}`}
    >
      {children}
    </label>
  );
}

function InputWrapper({
  icon, children, error, suffix, accent = 'gold'
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: boolean;
  suffix?: React.ReactNode;
  accent?: 'gold' | 'crimson';
}) {
  const borderColor = error
    ? 'border-red-500/60'
    : accent === 'crimson'
      ? 'border-white/10 focus-within:border-brand-crimson'
      : 'border-white/10 focus-within:border-brand-gold';

  return (
    <div className={`relative flex items-center bg-black/50 border rounded-full pl-4 pr-4 py-3 transition-colors ${borderColor}`}>
      <span className={`mr-3 flex-shrink-0 transition-colors ${error ? 'text-red-400' : 'text-white/30'}`}>{icon}</span>
      <div className="flex-1">{children}</div>
      {suffix && <span className="ml-3 flex-shrink-0">{suffix}</span>}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-red-400 text-xs mt-1.5 ml-4 flex items-center gap-1"
    >
      <AlertCircle className="w-3 h-3" />
      {msg}
    </motion.p>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 text-xs uppercase tracking-widest font-bold rounded-full transition-all ${active ? 'bg-white text-brand-black shadow' : 'text-white/40 hover:text-white'}`}
    >
      {children}
    </button>
  );
}
