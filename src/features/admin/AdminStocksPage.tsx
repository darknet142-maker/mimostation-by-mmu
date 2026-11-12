import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { Package, Fuel } from 'lucide-react';

export const AdminStocksPage: React.FC = () => {
  const { tanks, products } = useAppStore(s => ({
    tanks: s.tanks || [],
    products: s.products || [],
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Inventaire Réseau</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Produits, Cuves & Stocks Centralisés
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisez les niveaux de cuves souterraines et les stocks boutiques du réseau
          </p>
        </div>
      </div>

      {/* Tank Levels Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-blue-600" />
          <span>Niveaux des Cuves Souterraines (Station Référente)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tanks.map(tank => (
            <div key={tank.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span>{tank.fuelType}</span>
                <span className="text-blue-600">{tank.levelPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${tank.levelPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                {tank.currentLiters.toLocaleString('fr-FR')} L / {tank.capacityLiters.toLocaleString('fr-FR')} L
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Products & Boutique Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Catalogue des Produits & Tarifs</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher produit..."
              className="px-3 py-1.5 border rounded-xl text-xs bg-slate-50"
            />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 border rounded-xl text-xs bg-slate-50"
            >
              <option value="all">Toutes catégories</option>
              <option value="carburant">Carburant</option>
              <option value="gaz">Gaz</option>
              <option value="lubrifiants">Lubrifiants</option>
              <option value="boutique">Boutique</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-2 px-3">Produit</th>
                <th className="py-2 px-3">Catégorie</th>
                <th className="py-2 px-3">Prix Réglementé</th>
                <th className="py-2 px-3">Stock Central</th>
                <th className="py-2 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src={prod.image} alt={prod.name} className="w-6 h-6 object-contain" />
                    <span>{prod.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 capitalize">{prod.category}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {prod.priceFCFA.toLocaleString('fr-FR')} FCFA / {prod.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{prod.stockQuantity}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        prod.stockQuantity > prod.minStockThreshold
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {prod.stockQuantity > prod.minStockThreshold ? 'Stock OK' : 'Stock Faible'}
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
