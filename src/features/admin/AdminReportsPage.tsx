import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { BarChart3, Download } from 'lucide-react';
import { downloadCsv } from '@/utils/csv';

export const AdminReportsPage: React.FC = () => {
  const { dailyMetrics, stations, fuelTransactions, boutiqueSales } = useAppStore(s => ({
    dailyMetrics: s.dailyMetrics,
    stations: s.stations || [],
    fuelTransactions: s.fuelTransactions || [],
    boutiqueSales: s.boutiqueSales || [],
  }));

  const fuelRevenue = fuelTransactions.reduce((acc, t) => acc + t.amountFCFA, 0);
  const boutiqueRevenue = boutiqueSales.reduce((acc, b) => acc + b.totalFCFA, 0);
  const totalLiters = fuelTransactions.reduce((acc, t) => acc + t.quantityLiters, 0);

  const superLiters = fuelTransactions
    .filter(t => t.product.toLowerCase().includes('super'))
    .reduce((acc, t) => acc + t.quantityLiters, 0);
  const gasoilLiters = fuelTransactions
    .filter(t => t.product.toLowerCase().includes('gasoil'))
    .reduce((acc, t) => acc + t.quantityLiters, 0);
  const superPct = totalLiters > 0 ? Math.round((superLiters / totalLiters) * 100) : 0;
  const gasoilPct = totalLiters > 0 ? Math.round((gasoilLiters / totalLiters) * 100) : 0;

  const stationRows = stations.map(st => {
    const stFuel = fuelTransactions.filter(t => t.stationId === st.id);
    const stShop = boutiqueSales.filter(b => b.stationId === st.id);
    const revenue =
      stFuel.reduce((acc, t) => acc + t.amountFCFA, 0) +
      stShop.reduce((acc, b) => acc + b.totalFCFA, 0);
    const liters = stFuel.reduce((acc, t) => acc + t.quantityLiters, 0);
    return { station: st, revenue, liters };
  });

  const handleExportCsv = () => {
    downloadCsv(
      `stationpro-rapport-reseau-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Station', 'Ville', 'CA Réalisé (FCFA)', 'Litres Servis', 'Statut'],
      stationRows.map(r => [
        r.station.name,
        r.station.city,
        r.revenue,
        r.liters.toFixed(2),
        r.station.status === 'maintenance'
          ? 'Maintenance'
          : r.station.status === 'closed' || !r.station.isOpen
          ? 'Fermée'
          : 'Active',
      ])
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Analytique &amp; Performance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Rapports Réseau &amp; Chiffre d&apos;Affaires
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Consultez les volumes de carburant, ventes boutiques et performances réelles par station
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Rapport Réseau (CSV)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Chiffre d&apos;affaires Carburants</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {fuelRevenue.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            ↑ +{dailyMetrics?.growthPercentVsYesterday ?? 0}% vs hier • {fuelTransactions.length} ventes
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Chiffre d&apos;affaires Boutique &amp; Café</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {boutiqueRevenue.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-emerald-600 font-bold mt-1">
            {boutiqueSales.length} tickets enregistrés
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Volume Total Distribué</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {totalLiters.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Super : {superPct}% | Gasoil : {gasoilPct}%
          </p>
        </div>
      </div>

      {/* Station Ranking Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Performance par Station</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">Ville</th>
                <th className="py-2.5 px-3">CA Enregistré</th>
                <th className="py-2.5 px-3">Litres Servis</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stationRows.map(({ station: st, revenue, liters }) => {
                const isMaint = st.status === 'maintenance';
                const isClosed = st.status === 'closed' || !st.isOpen;
                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                    <td className="py-3 px-3 text-slate-600">{st.city}</td>
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {revenue.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 px-3 text-blue-700 font-semibold">
                      {liters.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L
                    </td>
                    <td className="py-3 px-3">
                      {isMaint ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                          Maintenance
                        </span>
                      ) : isClosed ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">
                          Fermée
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Opérationnelle
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
