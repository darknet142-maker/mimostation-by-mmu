import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { CheckCheck, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { alerts } = useAppStore(s => ({
    alerts: s.alerts,
  }));

  const handleMarkAllRead = () => {
    store.markAlertsAsRead();
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 bg-white min-h-full max-w-2xl mx-auto lg:rounded-3xl lg:border lg:border-slate-200/80 lg:shadow-xs lg:my-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">Notifications</h2>
          <p className="text-xs text-slate-500">Mises à jour et alertes de station</p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-xs font-semibold text-[#1668E3] hover:underline flex items-center gap-1"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Tout marquer lu</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {alerts.map(a => (
          <div
            key={a.id}
            className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
              a.isRead ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-xs'
            }`}
          >
            <div className="mt-0.5">{getAlertIcon(a.type)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                <span className="text-[10px] text-slate-400">{a.time}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{a.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
