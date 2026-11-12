import React from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Layers, Banknote, Smartphone } from 'lucide-react';

export const AdminTransactionsPage: React.FC = () => {
  const { fuelTransactions } = useAppStore(s => ({
    fuelTransactions: s.fuelTransactions || [],
  }));

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
            Audit en temps réel des encaissements carburant, boutique et paiements digitaux
          </p>
        </div>
      </div>

      {/* Fuel Transactions Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900">Transactions Carburant Récentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Heure</th>
                <th className="py-2.5 px-3">Pompe</th>
                <th className="py-2.5 px-3">Produit</th>
                <th className="py-2.5 px-3">Quantité</th>
                <th className="py-2.5 px-3">Montant</th>
                <th className="py-2.5 px-3">Mode Paiement</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {fuelTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{tx.time}</td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">#{tx.pumpNumber}</td>
                  <td className="py-2.5 px-3 font-semibold">{tx.product}</td>
                  <td className="py-2.5 px-3 font-mono">{tx.quantityLiters.toFixed(2)} L</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
