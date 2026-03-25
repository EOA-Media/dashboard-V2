import { useState } from 'react';
import { Radio, Eye, EyeOff, User, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup';

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: React.ReactNode;
  autoComplete?: string;
  suffix?: React.ReactNode;
}

function Field({ label, type, value, onChange, placeholder, icon, autoComplete, suffix }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-eoa-text-secondary uppercase tracking-wider">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-eoa-text-muted">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-eoa-card border border-eoa-border rounded-xl pl-10 pr-10 py-3 text-sm text-eoa-text-primary placeholder:text-eoa-text-muted focus:outline-none focus:border-eoa-blue/60 transition-colors duration-150"
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setEmail('');
    setPassword('');
    setUsername('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !username.trim()) {
      setError('Please enter a username.');
      return;
    }
    if (mode === 'signup' && username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, username.trim());

      if (result.error) {
        setError(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-eoa-bg flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl btn-gradient flex items-center justify-center shadow-glow-blue mb-4">
            <Radio className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-eoa-text-primary tracking-tight">EOA Media</h1>
          <p className="text-sm text-eoa-text-secondary mt-1 uppercase tracking-widest text-[10px]">AI Receptionist Dashboard</p>
        </div>

        <div className="gradient-border-card rounded-2xl p-6">
          <div className="flex bg-eoa-bg rounded-xl p-1 mb-6">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-eoa-card text-eoa-text-primary shadow-sm'
                    : 'text-eoa-text-secondary hover:text-eoa-text-primary'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Field
                label="Username"
                type="text"
                value={username}
                onChange={setUsername}
                placeholder="your_username"
                autoComplete="username"
                icon={<User className="w-4 h-4" strokeWidth={2} />}
              />
            )}

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail className="w-4 h-4" strokeWidth={2} />}
            />

            <Field
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              icon={<Lock className="w-4 h-4" strokeWidth={2} />}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-eoa-text-muted hover:text-eoa-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" strokeWidth={2} />
                    : <Eye className="w-4 h-4" strokeWidth={2} />}
                </button>
              }
            />

            {error && (
              <div className="bg-eoa-red/10 border border-eoa-red/25 rounded-xl px-3.5 py-2.5">
                <p className="text-xs text-eoa-red leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-gradient rounded-xl py-3 text-sm font-semibold text-white shadow-glow-blue flex items-center justify-center gap-2 transition-opacity duration-150 disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-eoa-border flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-eoa-text-muted flex-shrink-0" strokeWidth={2} />
            <p className="text-[11px] text-eoa-text-muted leading-relaxed">
              Your dashboard data is private and only visible to you.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-eoa-text-muted mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-eoa-blue hover:text-eoa-blue/80 font-semibold transition-colors"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
