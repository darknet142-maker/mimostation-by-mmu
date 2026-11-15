import React, { useMemo, useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Layers, Banknote, Smartphone, Search, Download } from 'lucide-react';
import { downloadCsv } from '@/utils/csv';

type CategoryFilter = 'all' | 'Carburant' | 'Boutique' | 'Réservation';

interface UnifiedTxRow {
  id: string;
  time: string;
  stationId: string;
  stationName: string;
  category: Exclude<CategoryFilter, 'all'>;
  detail: string;
  amountFCFA: number;
  paymentMethod: string;
  status: string;
}

export const AdminTransactionsPage: React.FC = () => {
  const { fuelTransactions, boutiqueSales, reservations, stations } = useAppStore(s => ({
    fuelTransactions: s.fuelTransactions || [],
    boutiqueSales: s.boutiqueSales || [],
    reservations: s.reservations || [],
    stations: s.stations || [],
  }));

  const [stationFilter, setStationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const rows = useMemo<UnifiedTxRow[]>(() => {
    const stationNameById = new Map(stations.map(s => [s.id, s.name]));

    const fuelRows: UnifiedTxRow[] = fuelTransactions.map(tx => ({
      id: tx.id,
      time: tx.time,
      stationId: tx.stationId,
      stationName: stationNameById.get(tx.stationId) || tx.stationId,
      category: 'Carburant',
      detail: `Pompe #${tx.pumpNumber} — ${tx.product} (${tx.quantityLiters.toFixed(2)} L)`,
      amountFCFA: tx.amountFCFA,
      paymentMethod: tx.paymentMethod,
      status: tx.status,
    }));

    const boutiqueRows: UnifiedTxRow[] = boutiqueSales.map(b => ({
      id: b.id,
      time: b.time,
      stationId: b.stationId,
      stationName: stationNameById.get(b.stationId) || b.stationId,
      category: 'Boutique',
      detail: b.items.map(i => `${i.productName} ×${i.quantity}`).join(', ') || b.saleNumber,
      amountFCFA: b.totalFCFA,
      paymentMethod: b.paymentMethod,
      status: b.status,
    }));

    const reservationRows: UnifiedTxRow[] = reservations.map(r => ({
      id: r.id,
      time: r.createdAt.slice(11, 16) || '—',
      stationId: r.stationId,
      stationName: r.stationName,
      category: 'Réservation',
      detail: `${r.productName} × ${r.quantity}`,
      amountFCFA: r.totalFCFA,
      paymentMethod: r.paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Sur place',
      status: r.status,
    }));

    return [...fuelRows, ...boutiqueRows, ...reservationRows];
  }, [fuelTransactions, boutiqueSales, reservations, stations]);

  const filtered = rows.filter(r => {
    const matchesStation = stationFilter === 'all' || r.stationId === stationFilter;
    const matchesCat = categoryFilter === 'all' || r.category === categoryFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      r.detail.toLowerCase().includes(q) ||
      r.stationName.toLowerCase().includes(q) ||
      r.paymentMethod.toLowerCase().includes(q);
    return matchesStation && matchesCat && matchesSearch;
  });

  const handleExportCsv = () => {
    downloadCsv(
      `stationpro-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Heure', 'Station', 'Catégorie', 'Détail', 'Montant (FCFA)', 'Paiement', 'Statut'],
      filtered.map(r => [
        r.id,
        r.time,
        r.stationName,
        r.category,
        r.detail,
        r.amountFCFA,
        r.paymentMethod,
        r.status,
      ])
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Layers className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Flux Financier</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Journal Central des Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit consolidé des encaissements carburant, boutique et réservations ({filtered.length} entrées)
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filtrer par produit, station, paiement..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'Carburant', 'Boutique', 'Réservation'] as const).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${categoryFilter === cat
                  ? 'bg-[#0B4DB3] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {cat === 'all' ? 'Toutes' : cat}
            </button>
          ))}

          <select
            value={stationFilter}
            onChange={e => setStationFilter(e.target.value)}
            aria-label="Filtrer par station"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
          >
            <option value="all">Toutes les stations</option>
            {stations.map(st => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Consolidated Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Heure</th>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3">Détail</th>
                <th className="py-2.5 px-3">Montant</th>
                <th className="py-2.5 px-3">Mode Paiement</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{tx.time}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{tx.stationName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{tx.detail}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {tx.amountFCFA.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 text-slate-700">
                      {tx.paymentMethod === 'Mobile Money' ? (
                        <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      ) : (
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{tx.paymentMethod}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucune transaction ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
