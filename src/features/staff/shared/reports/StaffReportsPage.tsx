import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { SectionCard } from '@/components/ui/SectionCard';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import { downloadCsv } from '@/utils/csv';

export const StaffReportsPage: React.FC = () => {
  const { dailyMetrics, fuelTransactions, boutiqueSales, selectedStationId, currentEmployee, stations } =
    useAppStore(s => ({
      dailyMetrics: s.dailyMetrics,
      fuelTransactions: s.fuelTransactions,
      boutiqueSales: s.boutiqueSales,
      selectedStationId: s.selectedStationId,
      currentEmployee: s.currentEmployee,
      stations: s.stations,
    }));

  const activeStationId = currentEmployee?.stationId || selectedStationId;
  const activeStation = stations.find(s => s.id === activeStationId) || stations[0];

  const stationFuelTx = fuelTransactions.filter(t => t.stationId === activeStationId);
  const stationBoutiqueSales = boutiqueSales.filter(b => b.stationId === activeStationId);

  const fuelVolume = stationFuelTx.reduce((acc, t) => acc + t.quantityLiters, 0);
  const fuelRevenue = stationFuelTx.reduce((acc, t) => acc + t.amountFCFA, 0);
  const boutiqueRevenue = stationBoutiqueSales.reduce((acc, b) => acc + b.totalFCFA, 0);
  const totalRevenue = fuelRevenue + boutiqueRevenue;
  const avgBasket =
    stationBoutiqueSales.length > 0 ? Math.round(boutiqueRevenue / stationBoutiqueSales.length) : 0;

  const handleExportCsv = () => {
    const rows: Array<Array<string | number>> = [
      ...stationFuelTx.map(t => [
        t.id,
        t.time,
        'Carburant',
        `Pompe #${t.pumpNumber} — ${t.product}`,
        `${t.quantityLiters.toFixed(2)} L`,
        t.amountFCFA,
        t.paymentMethod,
      ]),
      ...stationBoutiqueSales.map(b => [
        b.id,
        b.time,
        'Boutique',
        b.items.map(i => `${i.productName} ×${i.quantity}`).join(', ') || b.saleNumber,
        `${b.items.reduce((sum, i) => sum + i.quantity, 0)} art.`,
        b.totalFCFA,
        b.paymentMethod,
      ]),
    ];

    downloadCsv(
      `rapport-${activeStationId}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Heure', 'Catégorie', 'Détail', 'Volume / Qté', 'Montant (FCFA)', 'Paiement'],
      rows
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
          <div className="text-xs font-semibold text-slate-500">
            Recette Enregistrée ({activeStation?.name || 'Station'})
          </div>
          <div className="text-2xl font-extrabold text-[#0B3A82] mt-1">
            {new Intl.NumberFormat('fr-FR').format(totalRevenue)} FCFA
          </div>
          <div className="text-xs text-emerald-600 font-bold mt-1">
            ↑ +{dailyMetrics.growthPercentVsYesterday}% vs hier
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
          <div className="text-xs font-semibold text-slate-500">Volume Total Carburant</div>
          <div className="text-2xl font-extrabold text-[#1668E3] mt-1">
            {fuelVolume.toFixed(1)} L
          </div>
          <div className="text-xs text-slate-500 mt-1">{stationFuelTx.length} distributions</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
          <div className="text-xs font-semibold text-slate-500">Ventes Boutique Enregistrées</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {stationBoutiqueSales.length} tickets
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Panier moyen {new Intl.NumberFormat('fr-FR').format(avgBasket)} FCFA
          </div>
        </div>
      </div>

      {/* Hourly Sales Chart */}
      <SectionCard
        title="Progression des Ventes par Tranche Horaire"
        icon={<img src={ASSETS.official.uiActions.rapports} alt="" className="w-5 h-5 object-contain" />}
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
            <Button
              variant="outline-blue"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportCsv}
            >
              Exporter le rapport en CSV
            </Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};
