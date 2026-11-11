import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import { Fuel, RefreshCw } from 'lucide-react';

export const StaffPumpsPage: React.FC = () => {
  const { pumps, tanks } = useAppStore(s => ({
    pumps: s.pumps,
    tanks: s.tanks,
  }));

  const handleTogglePump = (pumpNumber: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'maintenance' : 'available';
    store.updatePumpStatus(pumpNumber, nextStatus as any);
  };

  return (
    <div className="space-y-6">
      {/* 6 Pompes Management */}
      <SectionCard
        title="Supervision et contrôle des 6 pompes"
        icon={<Fuel className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pumps.map(pump => (
            <div
              key={pump.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#1668E3] text-white font-extrabold text-sm flex items-center justify-center">
                    {pump.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Pompe #{pump.number}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{pump.fuelType}</p>
                  </div>
                </div>

                <StatusPill
                  type={pump.status === 'available' ? 'disponible' : 'maintenance'}
                  size="sm"
                  label={pump.status === 'available' ? 'Disponible' : 'Maintenance'}
                />
              </div>

              <div className="my-4 flex items-center justify-center">
                <img
                  src={ASSETS.icons.pump}
                  alt=""
                  className="h-20 object-contain"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Total distribué</div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {pump.litersToday.toFixed(1)} L
                  </div>
                </div>

                <Button
                  variant={pump.status === 'available' ? 'outline-blue' : 'yellow'}
                  size="sm"
                  onClick={() => handleTogglePump(pump.number, pump.status)}
                >
                  {pump.status === 'available' ? 'Passer en révision' : 'Rendre disponible'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Cuves et Niveaux */}
      <SectionCard title="Niveaux des Cuves Souterraines" icon={<RefreshCw className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tanks.map(tank => (
            <div key={tank.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{tank.fuelType}</span>
                <span className="text-xs font-bold text-[#1668E3]">{tank.levelPercent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  style={{ width: `${tank.levelPercent}%` }}
                  className={`h-full rounded-full transition-all ${
                    tank.levelPercent > 50
                      ? 'bg-emerald-500'
                      : tank.levelPercent > 25
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>{new Intl.NumberFormat('fr-FR').format(tank.currentLiters)} L</span>
                <span>Capacité {new Intl.NumberFormat('fr-FR').format(tank.capacityLiters)} L</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
