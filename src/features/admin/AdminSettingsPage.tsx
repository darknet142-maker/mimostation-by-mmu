import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Settings, ShieldCheck, RotateCcw } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { auditLogs } = useAppStore(s => ({
    auditLogs: s.auditLogs || [],
  }));

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetSystem = () => {
    if (window.confirm('Attention : réinitialiser toutes les données de test à leur état initial ?')) {
      store.resetAll();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <Settings className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Configuration Système</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
          Paramètres & Sécurité de la Plateforme
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Supervisez la licence, les sauvegardes et l'historique infalsifiable des modifications
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold">
          Plateforme réinitialisée avec succès aux données d'origine.
        </div>
      )}

      {/* License Status Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Licence StationPro Enterprise</h2>
              <p className="text-xs text-slate-500">Numéro de série : STP-ENT-2026-GA-99482</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
            Active • 31/12/2026
          </span>
        </div>
      </div>

      {/* Audit Log / Infalsifiable Proofs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Journal d'Audit Centralisé (Preuves Infalsifiables)
            </h2>
            <p className="text-xs text-slate-500">
              Chaque modification administrative est horodatée avec empreinte SHA-256
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
            {auditLogs.length} entrées scellées
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {auditLogs.slice(0, 15).map(log => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-start gap-3">
              <div>
                <p className="font-bold text-slate-800">{log.details}</p>
                <p className="text-[11px] text-slate-500">
                  Par {log.authorName} ({log.authorRole}) • Cible : {log.targetName}
                </p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Hash : {log.hash}</p>
              </div>
              <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                <span>{log.dateFormatted}</span> <br />
                <span>{log.timeFormatted}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance & Reset */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Réinitialiser les données locales</h3>
          <p className="text-xs text-slate-500">
            Restaure toutes les stations, utilisateurs, stocks et cuves aux valeurs par défaut
          </p>
        </div>
        <button
          onClick={handleResetSystem}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser</span>
        </button>
      </div>
    </div>
  );
};
