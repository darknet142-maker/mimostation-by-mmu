import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Bell, AlertTriangle, Info } from 'lucide-react';

export const AdminNotificationsPage: React.FC = () => {
  const { alerts } = useAppStore(s => ({
    alerts: s.alerts || [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Bell className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Centre d'Alertes</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Notifications Réseau & Alertes Opérationnelles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Journal centralisé des alertes de sécurité, stocks bas et livraisons
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map(a => (
          <div
            key={a.id}
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              a.type === 'danger'
                ? 'bg-red-50/60 border-red-200 text-red-900'
                : a.type === 'info'
                ? 'bg-blue-50/60 border-blue-200 text-blue-900'
                : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {a.type === 'danger' ? (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold">{a.title}</p>
                <p className="text-xs text-slate-600">{a.subtitle}</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-500">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
