import React, { useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StaffRole } from '@/types';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';

interface StaffAuthGuardProps {
  expectedRole: StaffRole;
}

export const StaffAuthGuard: React.FC<StaffAuthGuardProps> = ({ expectedRole }) => {
  const currentEmployee = useAppStore(s => s.currentEmployee);
  const location = useLocation();

  if (!currentEmployee || currentEmployee.role !== expectedRole) {
    return (
      <Navigate
        to={`/personnel/connexion/${expectedRole}`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return <Outlet />;
};

export const AdminAuthGuard: React.FC = () => {
  const { adminSession } = useAppStore(s => ({
    adminSession: s.adminSession,
  }));
  const navigate = useNavigate();

  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (adminSession?.isAuthenticated) {
    return <Outlet />;
  }

  const demoCode = import.meta.env.VITE_ADMIN_ACCESS_CODE || '202699';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = store.loginAdmin(accessCode);
    if (!result.success) {
      setErrorMsg(result.message || 'Code d’accès invalide.');
    }
  };

  return (
    <main className="min-h-screen bg-[#061226] text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <BrandLogo theme="light" mode="admin" size="sm" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#0B4DB3] text-[11px] font-bold border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Accès Protégé
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-xl font-black text-[#0A1D37]">Console Super Administration</h1>
          <p className="text-xs text-slate-500">
            Authentifiez-vous avec le code administrateur réseau pour accéder aux réglages 360°, stations et journal d&apos;audit.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-access-code" className="block text-xs font-bold text-slate-700 mb-1.5">
              Code d&apos;accès Super Administrateur
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-access-code"
                type={showCode ? 'text' : 'password'}
                value={accessCode}
                onChange={e => {
                  setAccessCode(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                autoComplete="current-password"
                required
                placeholder="Saisissez le code confidentiel"
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#0B4DB3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B4DB3]/30 text-sm font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowCode(v => !v)}
                aria-label={showCode ? 'Masquer le code' : 'Afficher le code'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-900/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Ouvrir la Console Admin
          </button>
        </form>

        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
          <div className="text-[11px] text-amber-900 leading-snug">
            <strong className="block font-bold">Bac à sable de démonstration</strong>
            <span>Environnement local : pré-remplir le code de test configuré.</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setAccessCode(demoCode);
              setErrorMsg(null);
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-extrabold transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Code Démo
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour au portail client
        </button>
      </div>
    </main>
  );
};
