import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { ROLE_DEFINITIONS } from '@/data/fixtures';
import { StaffRole } from '@/types';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { ASSETS } from '@/config/assets';
import {
  Shield,
  RefreshCw,
  Smartphone,
} from 'lucide-react';

export const StaffSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentEmployee, selectedStationId, stations } = useAppStore(s => ({
    currentEmployee: s.currentEmployee,
    selectedStationId: s.selectedStationId,
    stations: s.stations,
  }));

  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const handleRoleSwitch = (newRole: StaffRole) => {
    store.setCurrentRole(newRole);
    navigate(`/personnel/${newRole}`);
  };

  const handleResetData = () => {
    if (window.confirm('Réinitialiser toutes les données de démonstration locales ?')) {
      store.resetAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* Employee Identity Card */}
      <SectionCard title="Mon Profil Professionnel" icon={<img src={ASSETS.official.uiActions.parametres} alt="" className="w-5 h-5 object-contain" />}>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src={currentEmployee?.avatar}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover bg-blue-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {currentEmployee?.name}
                </h3>
                <StatusPill type="active" size="sm" label="En service" />
              </div>
              <p className="text-xs font-semibold text-[#0B3A82] mt-0.5">
                {currentEmployee?.title} — {currentEmployee?.subtitle}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Affectation : {activeStation.name} ({activeStation.city})
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-bold text-slate-400">PIN : ****</span>
          </div>
        </div>
      </SectionCard>

      {/* Switch Role Fast Bar */}
      <SectionCard
        title="Basculer vers un autre Poste (Mode Démonstration)"
        icon={<Shield className="w-5 h-5 text-amber-500" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ROLE_DEFINITIONS.map(r => {
            const isCurrent = currentEmployee?.role === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleSwitch(r.role)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  isCurrent
                    ? 'border-[#1668E3] bg-blue-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">{r.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{r.defaultEmployeeName}</div>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* Local System Controls */}
      <SectionCard title="Environnement Local & Démonstration" icon={<RefreshCw className="w-5 h-5" />}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            L'application fonctionne actuellement sur son moteur de stockage local réactif avec synchronisation multi-onglets (Phase 1). Lors de la Phase 2, ces flux basculeront sur Supabase, GitHub et Vercel avec persistance Cloud.
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline-blue"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleResetData}
            >
              Réinitialiser les données locales
            </Button>

            <Button
              variant="navy"
              size="sm"
              icon={<Smartphone className="w-4 h-4" />}
              onClick={() => navigate('/')}
            >
              Aller sur l'interface Client
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
