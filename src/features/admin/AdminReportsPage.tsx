import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { BarChart3, Download } from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { dailyMetrics, stations } = useAppStore(s => ({
    dailyMetrics: s.dailyMetrics,
    stations: s.stations || [],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Analytique & Performance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Rapports Réseau & Chiffre d'Affaires
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Consultez les volumes de carburant, ventes boutiques et performances globales
          </p>
        </div>

        <button
          onClick={() => alert('Téléchargement du rapport réseau officiel PDF généré.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Rapport Réseau</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Chiffre d'affaires Carburants</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {(dailyMetrics?.fuelRevenueFCFA || 243500).toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-emerald-600 font-bold mt-1">↑ +14.2% vs semaine passée</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Chiffre d'affaires Boutique & Café</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {(dailyMetrics?.boutiqueRevenueFCFA || 410200).toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-xs text-emerald-600 font-bold mt-1">↑ +9.5% vs semaine passée</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Volume Total Distribué</p>
          <p className="text-2xl font-black text-blue-600 mt-1">142 850 L</p>
          <p className="text-xs text-slate-500 mt-1">Super : 58% | Gasoil : 42%</p>
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
                <th className="py-2.5 px-3">CA Réalisé (Jour)</th>
                <th className="py-2.5 px-3">Litres Servis</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stations.map(st => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                  <td className="py-3 px-3 text-slate-600">{st.city}</td>
                  <td className="py-3 px-3 text-slate-900 font-bold">1 250 000 FCFA</td>
                  <td className="py-3 px-3 text-blue-700 font-semibold">1 785 L</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Opérationnelle
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
