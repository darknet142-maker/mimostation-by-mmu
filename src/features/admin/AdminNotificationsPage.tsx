import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Bell, AlertTriangle, Info, CheckCheck } from 'lucide-react';

type AlertFilter = 'all' | 'unread' | 'danger';

export const AdminNotificationsPage: React.FC = () => {
  const { alerts } = useAppStore(s => ({
    alerts: s.alerts || [],
  }));

  const [filter, setFilter] = useState<AlertFilter>('all');

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'danger') return a.type === 'danger';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Bell className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Centre d&apos;Alertes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Notifications Réseau &amp; Alertes Opérationnelles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Journal centralisé des alertes de sécurité, stocks bas, paiements et livraisons
          </p>
        </div>

        <button
          type="button"
          onClick={() => store.markAlertsAsRead()}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Tout marquer comme lu ({unreadCount})</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'all', label: `Toutes (${alerts.length})` },
            { id: 'unread', label: `Non lues (${unreadCount})` },
            { id: 'danger', label: `Critiques (${alerts.filter(a => a.type === 'danger').length})` },
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === tab.id
                ? 'bg-[#0B4DB3] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(a => (
          <div
            key={a.id}
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${a.type === 'danger'
                ? 'bg-red-50/60 border-red-200 text-red-900'
                : a.type === 'info'
                  ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                  : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
              } ${!a.isRead ? 'ring-2 ring-blue-500/20' : 'opacity-85'}`}
          >
            <div className="flex items-center gap-3">
              {a.type === 'danger' ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold">{a.title}</p>
                  {!a.isRead && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">
                      Nouveau
                    </span>
                  )}
                  {a.audience && (
                    <span className="px-1.5 py-0.5 rounded bg-white/80 text-slate-700 border border-slate-200 text-[10px] font-semibold">
                      {a.audience === 'client' ? 'Public Client' : 'Équipes'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{a.subtitle}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500 shrink-0">{a.time}</span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            Aucune alerte dans cette vue.
          </div>
        )}
      </div>
    </div>
  );
};
