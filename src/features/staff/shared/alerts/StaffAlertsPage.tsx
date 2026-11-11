import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { ASSETS } from '@/config/assets';

export const StaffAlertsPage: React.FC = () => {
  const { alerts } = useAppStore(s => ({
    alerts: s.alerts,
  }));

  const handleMarkAllRead = () => {
    store.markAlertsAsRead();
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Journal des Alertes & Notifications"
        icon={<img src={ASSETS.official.uiActions.alerte} alt="" className="w-5 h-5 object-contain" />}
        actionLabel="Tout marquer comme lu"
        onAction={handleMarkAllRead}
      >
        <div className="space-y-3">
          {alerts.map(alt => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
                alt.isRead ? 'bg-white border-slate-200' : 'bg-blue-50/50 border-blue-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {alt.type === 'danger' ? (
                    <img src={ASSETS.official.uiActions.stockFaible} alt="" className="w-5 h-5 object-contain" />
                  ) : alt.type === 'info' ? (
                    <img src={ASSETS.official.uiActions.information} alt="" className="w-5 h-5 object-contain" />
                  ) : (
                    <img src={ASSETS.official.uiActions.disponible} alt="" className="w-5 h-5 object-contain" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{alt.title}</h4>
                    {!alt.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{alt.subtitle}</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-400 shrink-0">
                {alt.time}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
