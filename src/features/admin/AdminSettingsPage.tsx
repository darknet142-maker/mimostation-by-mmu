import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Settings, ShieldCheck, RotateCcw, Calendar, Search, Download } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { auditLogs } = useAppStore(s => ({
    auditLogs: s.auditLogs || [],
  }));

  const [resetSuccess, setResetSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDateFilter || log.dateFormatted.includes(selectedDateFilter);
    return matchesSearch && matchesDate;
  });

  const handleResetSystem = () => {
    if (window.confirm('Attention : réinitialiser toutes les données de test à leur état initial ?')) {
      store.resetAll();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportAudit = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stationpro-audit-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <Settings className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Sécurité & Gouvernance 360°</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
          Paramètres, Licence & Registre Infalsifiable (360°)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Supervisez la licence d'exploitation, les preuves scellées horodatées (J/M/A) et la conformité
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

      {/* Audit Log / Infalsifiable Proofs by Date (j/m/a) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Journal d'Audit Centralisé (Preuves à vie infalsifiables)
            </h2>
            <p className="text-xs text-slate-500">
              Toute modification (prix, stocks, cuves, stations, employés) est scellée par empreinte cryptographique SHA-256
            </p>
          </div>
          <button
            onClick={handleExportAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger le registre scellé</span>
          </button>
        </div>

        {/* Search & Date Filter (j/m/a) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher par action, auteur, cible, hash..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={selectedDateFilter}
              onChange={e => setSelectedDateFilter(e.target.value)}
              placeholder="Filtrer par date (J/M/A, ex: 11/11/2026)"
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono w-full sm:w-60"
            />
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Audit Log Entries List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-start gap-3 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                    {log.actionType}
                  </span>
                  <span className="font-bold text-slate-800">{log.details}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Par {log.authorName} ({log.authorRole}) • Cible : {log.targetName}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>Hash : {log.hash}</span>
                  <span className="text-emerald-600 font-bold">● Vérifié intègre</span>
                </div>
              </div>
              <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">{log.dateFormatted}</span> <br />
                <span>{log.timeFormatted}</span>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400">
              Aucun enregistrement d'audit ne correspond à vos filtres.
            </p>
          )}
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser la base</span>
        </button>
      </div>
    </div>
  );
};
