import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarCheck2, Check, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

const inputClass = 'h-12 w-full rounded-lg border border-[#E2E5EC] bg-[#F8F9FC] pl-11 pr-12 text-[14px] font-semibold text-gray-900 outline-none transition focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-50 placeholder:text-gray-400';

const RecoveryShell: React.FC<{ eyebrow: string; title: string; subtitle: string; children: React.ReactNode }> = ({ eyebrow, title, subtitle, children }) => (
  <main className="min-h-screen bg-[#F8F9FC] p-3 sm:p-5 lg:p-6">
    <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-[1280px] overflow-hidden rounded-lg border border-[#E7E9EF] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[0.88fr_1.12fr]">
      <section className="relative hidden bg-[#111827] px-12 py-11 text-white lg:flex lg:flex-col">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-400" />
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-600"><CalendarCheck2 className="h-6 w-6" /></div>
          <div><p className="text-xl font-extrabold"><span className="text-red-500">Event</span>Hub360</p><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Enterprise Concierge</p></div>
        </div>
        <div className="my-auto max-w-md">
          <ShieldCheck className="mb-6 h-9 w-9 text-red-400" />
          <h2 className="text-[40px] font-extrabold leading-tight">Secure account recovery.</h2>
          <p className="mt-5 text-[15px] font-medium leading-7 text-gray-300">Reset links expire after 15 minutes and can only update the account identified by the signed token.</p>
        </div>
        <p className="border-t border-white/10 pt-6 text-[11px] font-semibold text-gray-500">Protected by short-lived signed tokens</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-[470px]">
          <div className="mb-9 flex items-center gap-3 lg:hidden"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white"><CalendarCheck2 className="h-5 w-5" /></div><p className="text-xl font-extrabold"><span className="text-red-600">Event</span>Hub360</p></div>
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-red-600">{eyebrow}</p>
          <h1 className="text-[32px] font-extrabold text-gray-900">{title}</h1>
          <p className="mt-2 mb-8 text-[14px] font-medium text-gray-500">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  </main>
);

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('remembered_login_email') || '');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.requestPasswordReset(email);
      setMessage(response.message);
      if (response.resetToken) {
        navigate('/reset-password?token=' + encodeURIComponent(response.resetToken), { replace: true });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start password recovery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecoveryShell eyebrow="Account recovery" title="Forgot your password?" subtitle="Enter the email connected to your EventHub360 account.">
      {error && <Alert text={error} />}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-[13px] font-semibold text-emerald-800">
          <Check className="mb-3 h-5 w-5" />{message}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <label className="block"><span className="mb-2 block text-[12px] font-extrabold text-gray-700">Work email</span><span className="relative block"><Mail className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="name@company.com" autoComplete="email" /></span></label>
          <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-[14px] font-extrabold text-white disabled:opacity-60">{loading ? 'Preparing reset...' : 'Continue'}<ArrowRight className="h-4 w-4" /></button>
        </form>
      )}
      <Link to="/login" className="mt-7 flex items-center justify-center gap-2 text-[13px] font-extrabold text-red-600"><ArrowLeft className="h-4 w-4" />Back to sign in</Link>
    </RecoveryShell>
  );
};

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(token ? '' : 'The reset token is missing.');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const checks = useMemo(() => ({
    length: password.length >= 8,
    mixed: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
  }), [password]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!Object.values(checks).every(Boolean)) return setError('Please meet all password requirements.');
    if (password !== confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const response = await authService.resetPassword(token, password);
      setSuccess(response.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RecoveryShell eyebrow="Choose password" title="Create a new password" subtitle="Use a strong password you have not used for this account before.">
      {error && <Alert text={error} />}
      {success ? (
        <div><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-[13px] font-semibold text-emerald-800"><Check className="mb-3 h-5 w-5" />{success}</div><Link to="/login" className="mt-5 flex h-12 items-center justify-center rounded-lg bg-gray-950 text-[14px] font-extrabold text-white">Return to sign in</Link></div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <PasswordInput label="New password" value={password} setValue={setPassword} show={showPassword} setShow={setShowPassword} />
          <PasswordInput label="Confirm password" value={confirm} setValue={setConfirm} show={showConfirm} setShow={setShowConfirm} />
          <div className="grid grid-cols-3 gap-2"><CheckItem valid={checks.length} text="8+ characters" /><CheckItem valid={checks.mixed} text="Upper & lower" /><CheckItem valid={checks.number} text="One number" /></div>
          <button disabled={loading || !token} className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-[14px] font-extrabold text-white disabled:opacity-60">{loading ? 'Resetting...' : 'Reset password'}<KeyRound className="h-4 w-4" /></button>
        </form>
      )}
    </RecoveryShell>
  );
};

const PasswordInput = ({ label, value, setValue, show, setShow }: { label: string; value: string; setValue: (value: string) => void; show: boolean; setShow: (value: boolean) => void }) => (
  <label className="block"><span className="mb-2 block text-[12px] font-extrabold text-gray-700">{label}</span><span className="relative block"><LockKeyhole className="absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" /><input required minLength={8} type={show ? 'text' : 'password'} value={value} onChange={(event) => setValue(event.target.value)} className={inputClass} autoComplete="new-password" /><button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
);

const CheckItem = ({ valid, text }: { valid: boolean; text: string }) => <div className={'flex min-h-9 items-center gap-1 rounded-md border px-2 text-[10px] font-bold ' + (valid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-gray-50 text-gray-400')}><Check className="h-3 w-3" />{text}</div>;
const Alert = ({ text }: { text: string }) => <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-800">{text}</div>;