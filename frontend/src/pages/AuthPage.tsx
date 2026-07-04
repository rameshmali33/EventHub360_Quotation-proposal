import React, { useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CalendarCheck2, Check, Eye, EyeOff, FileCheck2, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

const fieldClass =
  'h-12 w-full rounded-lg border border-[#E2E5EC] bg-[#F8F9FC] pl-11 pr-4 text-[14px] font-semibold text-gray-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 placeholder:text-gray-400';

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const isSignUp = mode === 'signup';
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    organizationName: '',
    email: localStorage.getItem('remembered_login_email') || '',
    password: '',
    remember: true,
  });

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 8,
      mixed: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password),
      number: /\d/.test(form.password),
    }),
    [form.password],
  );

  if (user) return <Navigate to="/" replace />;

  const update = (key: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (error) setError('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (isSignUp && (!acceptedTerms || !Object.values(passwordChecks).every(Boolean))) {
      setError(!acceptedTerms ? 'Please accept the terms to create your account.' : 'Please meet all password requirements.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp({
          firstName: form.firstName,
          lastName: form.lastName,
          organizationName: form.organizationName,
          email: form.email,
          password: form.password,
        });
      } else {
        await signIn(form.email, form.password);
        if (form.remember) localStorage.setItem('remembered_login_email', form.email);
        else localStorage.removeItem('remembered_login_email');
      }
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not complete your request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FC] p-3 sm:p-5 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-[1440px] overflow-hidden rounded-lg border border-[#E7E9EF] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#111827] px-12 py-11 text-white lg:flex lg:flex-col">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-400" />
          <div className="absolute -right-28 top-32 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-10 top-52 h-44 w-44 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600 shadow-[0_8px_24px_rgba(220,38,38,0.35)]">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-[0]"><span className="text-red-500">Event</span>Hub360</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Enterprise Concierge</p>
            </div>
          </div>

          <div className="relative my-auto max-w-[520px] py-12">
            <p className="mb-5 text-[12px] font-extrabold uppercase tracking-[0.2em] text-red-400">Quotation command center</p>
            <h1 className="max-w-[500px] text-[46px] font-extrabold leading-[1.08] tracking-[0]">
              Every event opportunity, under control.
            </h1>
            <p className="mt-6 max-w-[480px] text-[16px] font-medium leading-7 text-gray-300">
              Build accurate quotations, manage approvals, and deliver polished proposals from one connected workspace.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-3">
              {[
                { value: '01', label: 'Unified pricing', icon: FileCheck2 },
                { value: '02', label: 'Clear approvals', icon: ShieldCheck },
                { value: '03', label: 'Faster proposals', icon: ArrowRight },
              ].map(({ value, label, icon: Icon }) => (
                <div key={value} className="border-l border-white/15 pl-4">
                  <Icon className="mb-3 h-5 w-5 text-red-400" />
                  <p className="text-[11px] font-bold text-gray-500">{value}</p>
                  <p className="mt-1 text-[13px] font-bold text-gray-200">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t border-white/10 pt-6 text-[11px] font-semibold text-gray-500">
            <span>Built for modern event teams</span>
            <span className="flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5" /> Secure workspace</span>
          </div>
        </section>

        <section className="flex min-h-[680px] items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-[500px]">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
              <p className="text-xl font-extrabold text-gray-900"><span className="text-red-600">Event</span>Hub360</p>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                {isSignUp ? 'Create account' : 'Welcome back'}
              </p>
              <h2 className="text-[32px] font-extrabold tracking-[0] text-gray-900">
                {isSignUp ? 'Start with EventHub360' : 'Sign in to your account'}
              </h2>
              <p className="mt-2 text-[14px] font-medium text-gray-500">
                {isSignUp ? 'Create a secure client account for your organization.' : 'Continue to your quotation management workspace.'}
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-800">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">!</span>
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <AuthField label="First name" icon={User}>
                      <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className={fieldClass} placeholder="Ramesh" autoComplete="given-name" />
                    </AuthField>
                    <AuthField label="Last name" icon={User}>
                      <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className={fieldClass} placeholder="Mali" autoComplete="family-name" />
                    </AuthField>
                  </div>
                  <AuthField label="Organization name" icon={Building2}>
                    <input required value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} className={fieldClass} placeholder="Your event company" autoComplete="organization" />
                  </AuthField>
                </>
              )}

              <AuthField label="Work email" icon={Mail}>
                <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={fieldClass} placeholder="name@company.com" autoComplete="email" />
              </AuthField>

              <AuthField label="Password" icon={LockKeyhole}>
                <input
                  required
                  minLength={8}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className={`${fieldClass} pr-12`}
                  placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </AuthField>

              {isSignUp ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    <PasswordCheck valid={passwordChecks.length} label="8+ characters" />
                    <PasswordCheck valid={passwordChecks.mixed} label="Upper & lower" />
                    <PasswordCheck valid={passwordChecks.number} label="One number" />
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-[12px] font-semibold leading-5 text-gray-600">
                    <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 h-4 w-4 accent-red-600" />
                    I agree to the Terms of Service and Privacy Policy for this workspace.
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-gray-600">
                    <input type="checkbox" checked={form.remember} onChange={(e) => update('remember', e.target.checked)} className="h-4 w-4 accent-red-600" />
                    Remember my email
                  </label>
                  <Link to="/forgot-password" className="text-[13px] font-extrabold text-red-600 hover:text-red-700">Forgot password?</Link>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-[14px] font-extrabold text-white shadow-[0_8px_22px_rgba(220,38,38,0.22)] transition hover:shadow-[0_10px_28px_rgba(220,38,38,0.3)] disabled:cursor-not-allowed disabled:opacity-65"
              >
                {submitting ? <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <>{isSignUp ? 'Create account' : 'Sign in'}<ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="mt-7 text-center text-[13px] font-semibold text-gray-500">
              {isSignUp ? 'Already have an account?' : 'New to EventHub360?'}{' '}
              <Link to={isSignUp ? '/login' : '/signup'} className="font-extrabold text-red-600 hover:text-red-700">
                {isSignUp ? 'Sign in' : 'Create account'}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

const AuthField: React.FC<{ label: string; icon: React.ElementType; children: React.ReactNode }> = ({ label, icon: Icon, children }) => (
  <label className="block">
    <span className="mb-2 block text-[12px] font-extrabold text-gray-700">{label}</span>
    <span className="relative block">
      <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />
      {children}
    </span>
  </label>
);

const PasswordCheck: React.FC<{ valid: boolean; label: string }> = ({ valid, label }) => (
  <div className={`flex min-h-9 items-center gap-1.5 rounded-md border px-2 text-[10px] font-bold ${valid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
    <Check className="h-3 w-3 shrink-0" />
    <span>{label}</span>
  </div>
);

export default AuthPage;