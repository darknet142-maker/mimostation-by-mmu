import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { SectionCard } from '@/components/ui/SectionCard';
import { BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const StaffReportsPage: React.FC = () => {
  const { dailyMetrics, fuelTransactions, boutiqueSales } = useAppStore(s => ({
    dailyMetrics: s.dailyMetrics,
    fuelTransactions: s.fuelTransactions,
    boutiqueSales: s.boutiqueSales,
  }));

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
          <div className="text-xs font-semibold text-slate-500">Chiffre Global du Jour</div>
          <div className="text-2xl font-extrabold text-[#0B3A82] mt-1">
            {new Intl.NumberFormat('fr-FR').format(dailyMetrics.totalRevenueFCFA)} FCFA
          </div>
          <div className="text-xs text-emerald-600 font-bold mt-1">↑ +{dailyMetrics.growthPercentVsYesterday}% vs hier</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
          <div className="text-xs font-semibold text-slate-500">Volume Total Carburant</div>
          <div className="text-2xl font-extrabold text-[#1668E3] mt-1">
            {fuelTransactions.reduce((acc, t) => acc + t.quantityLiters, 0).toFixed(1)} L
          </div>
          <div className="text-xs text-slate-400 mt-1">{fuelTransactions.length} distributions</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
          <div className="text-xs font-semibold text-slate-500">Ventes Boutique Enregistrées</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {boutiqueSales.length} tickets
          </div>
          <div className="text-xs text-slate-400 mt-1">Panier moyen 1 850 FCFA</div>
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <SectionCard
        title="Progression des Ventes par Tranche Horaire"
        icon={<BarChart3 className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2 sm:gap-4 h-48 pt-6 pb-2 px-2 border-b border-slate-100">
            {dailyMetrics.hourlySales.map(item => {
              const maxAmt = 800000;
              const heightPct = Math.min(100, Math.round((item.amountFCFA / maxAmt) * 100));
              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500">
                    {Math.round(item.amountFCFA / 1000)}k
                  </span>
                  <div className="w-full bg-blue-100 rounded-t-lg flex items-end h-32">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-[#1668E3] hover:bg-[#0B3A82] rounded-t-lg transition-all"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{item.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline-blue" size="sm" icon={<Download className="w-4 h-4" />}>
              Exporter le rapport en CSV
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
