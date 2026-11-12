import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Product, TankLevel } from '@/types';
import {
  Package,
  Fuel,
  Plus,
  Truck,
  Check,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

export const AdminStocksPage: React.FC = () => {
  const { tanks, products, networkConfig } = useAppStore(s => ({
    tanks: s.tanks || [],
    products: s.products || [],
    networkConfig: s.networkConfig,
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Tank Refill State
  const [selectedTankForRefill, setSelectedTankForRefill] = useState<TankLevel | null>(null);
  const [refillLiters, setRefillLiters] = useState(10000);
  const [refillSupplier, setRefillSupplier] = useState('TOTAL Distribution Gabon');

  // Network Fuel Pricing Form
  const [priceSuper, setPriceSuper] = useState(networkConfig?.fuelPrices?.super || 700);
  const [priceGasoil, setPriceGasoil] = useState(networkConfig?.fuelPrices?.gasoil || 650);
  const [pricePetrole, setPricePetrole] = useState(networkConfig?.fuelPrices?.petroleLampant || 450);
  const [priceGaz, setPriceGaz] = useState(networkConfig?.fuelPrices?.gazButane || 6000);

  // New Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('boutique');
  const [newProdSubtitle, setNewProdSubtitle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(1000);
  const [newProdUnit, setNewProdUnit] = useState('pièce');
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdThreshold, setNewProdThreshold] = useState(10);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTankForRefill) return;

    store.refillTank(selectedTankForRefill.id, refillLiters, refillSupplier);
    setSuccessToast(
      `Livraison de ${refillLiters.toLocaleString('fr-FR')} L dans la cuve ${selectedTankForRefill.fuelType} enregistrée !`
    );
    setSelectedTankForRefill(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleApplyPrices = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateFuelPrices({
      super: Number(priceSuper),
      gasoil: Number(priceGasoil),
      petroleLampant: Number(pricePetrole),
      gazButane: Number(priceGaz),
    });
    setSuccessToast('Tarifs officiels des carburants et gaz synchronisés sur tout le réseau !');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    store.addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      subtitle: newProdSubtitle || 'Produit réseau',
      priceFCFA: Number(newProdPrice),
      unit: newProdUnit,
      image: '/assets/icons/cube.svg',
      isAvailable: true,
      stockQuantity: Number(newProdStock),
      minStockThreshold: Number(newProdThreshold),
    });

    setSuccessToast(`Référence "${newProdName}" créée avec succès dans le catalogue !`);
    setShowAddProductModal(false);
    setNewProdName('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Logistique Réseau</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Cuves Souterraines, Produits & Tarification Réseau (360°)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion complète des niveaux de cuves, livraisons camions-citernes et tarification réglementée
          </p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nouvelle Référence</span>
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* 1. TANK LEVELS & TANKER REFILL SECTION 360° */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-blue-600" />
            <span>Niveaux des Cuves Souterraines & Approvisionnement</span>
          </h2>
          <span className="text-xs text-slate-500">
            Suivi jauge électronique en temps réel (Jauge Veeder-Root)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tanks.map(tank => {
            const isCritical = tank.status === 'critical';
            const isLow = tank.status === 'low';

            return (
              <div
                key={tank.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-900 text-sm">{tank.fuelType}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                        isCritical
                          ? 'bg-rose-100 text-rose-700'
                          : isLow
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {tank.levelPercent}% restant
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-600' : isLow ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${tank.levelPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
                    <span>{tank.currentLiters.toLocaleString('fr-FR')} L</span>
                    <span>Capacité : {tank.capacityLiters.toLocaleString('fr-FR')} L</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTankForRefill(tank);
                      setRefillLiters(5000);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Livrer Camion-Citerne</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. OFFICIAL FUEL PRICING FORM (Tarification Réseau 360°) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <DollarSign className="w-5 h-5 text-amber-500" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Barème Officiel des Prix des Carburants & Gaz (360°)
            </h2>
            <p className="text-xs text-slate-500">
              Les prix fixés ici se répercutent automatiquement sur tous les totems, distributeurs et fiches clients
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyPrices} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Super Sans Plomb (FCFA / Litre)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={100}
                max={5000}
                value={priceSuper}
                onChange={e => setPriceSuper(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:bg-white"
              />
              <span className="font-bold text-slate-500">FCFA</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Gasoil / Diesel (FCFA / Litre)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={100}
                max={5000}
                value={priceGasoil}
                onChange={e => setPriceGasoil(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:bg-white"
              />
              <span className="font-bold text-slate-500">FCFA</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pétrole Lampant (FCFA / Litre)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={100}
                max={5000}
                value={pricePetrole}
                onChange={e => setPricePetrole(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:bg-white"
              />
              <span className="font-bold text-slate-500">FCFA</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Gaz Butane (Bouteille 6 kg)</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={500}
                max={50000}
                value={priceGaz}
                onChange={e => setPriceGaz(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold text-sm text-slate-900 focus:bg-white"
              />
              <span className="font-bold text-slate-500">FCFA</span>
            </div>
          </div>

          <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Appliquer les nouveaux tarifs sur tout le réseau</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. PRODUCTS & BOUTIQUE TABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">Catalogue des Produits & Stocks en Rayon</h2>
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
                <th className="py-2.5 px-3">Produit</th>
                <th className="py-2.5 px-3">Catégorie</th>
                <th className="py-2.5 px-3">Prix Unitaire</th>
                <th className="py-2.5 px-3">Stock Disponible</th>
                <th className="py-2.5 px-3">Seuil d'Alerte</th>
                <th className="py-2.5 px-3">Actions Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center gap-2">
                    <img src={prod.image} alt={prod.name} className="w-6 h-6 object-contain" />
                    <div>
                      <p>{prod.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">{prod.subtitle}</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 capitalize">{prod.category}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">
                    {prod.priceFCFA.toLocaleString('fr-FR')} FCFA / {prod.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                    {prod.stockQuantity} {prod.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {prod.minStockThreshold} {prod.unit}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => store.updateProduct(prod.id, { stockQuantity: prod.stockQuantity + 10 })}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs"
                        title="Ajouter 10 unités"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => store.updateProduct(prod.id, { stockQuantity: prod.stockQuantity + 50 })}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs"
                        title="Ajouter 50 unités"
                      >
                        +50
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: TANKER REFILL MODAL */}
      {selectedTankForRefill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <span>Livraison Camion-Citerne • {selectedTankForRefill.fuelType}</span>
              </h2>
              <button
                onClick={() => setSelectedTankForRefill(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-800">
                <p className="font-semibold">Niveau actuel de la cuve :</p>
                <p className="text-sm font-bold">
                  {selectedTankForRefill.currentLiters.toLocaleString('fr-FR')} L / {selectedTankForRefill.capacityLiters.toLocaleString('fr-FR')} L ({selectedTankForRefill.levelPercent}%)
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Volume à décharger (Litres) *</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[5000, 10000, 15000].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRefillLiters(v)}
                      className={`py-1.5 rounded-lg border font-bold text-xs ${
                        refillLiters === v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200'
                      }`}
                    >
                      +{v.toLocaleString('fr-FR')} L
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={500}
                  max={selectedTankForRefill.capacityLiters - selectedTankForRefill.currentLiters}
                  value={refillLiters}
                  onChange={e => setRefillLiters(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fournisseur / Transporteur *</label>
                <select
                  value={refillSupplier}
                  onChange={e => setRefillSupplier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                >
                  <option value="TOTAL Distribution Gabon">TOTAL Distribution Gabon</option>
                  <option value="SOGARA Raffinerie Port-Gentil">SOGARA Raffinerie Port-Gentil</option>
                  <option value="PetroGabon Logistique">PetroGabon Logistique</option>
                  <option value="Ola Energy Transport">Ola Energy Transport</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedTankForRefill(null)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Confirmer le dépotage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Ajouter une Référence Produit</h2>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom du produit *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  placeholder="ex: Liquide de frein DOT4"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  >
                    <option value="boutique">Boutique</option>
                    <option value="lubrifiants">Lubrifiants</option>
                    <option value="gaz">Gaz</option>
                    <option value="auto">Auto & Accessoires</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unité</label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={e => setNewProdUnit(e.target.value)}
                    placeholder="ex: flacon, bidon 1L, paquet"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sous-titre / Spécification</label>
                <input
                  type="text"
                  value={newProdSubtitle}
                  onChange={e => setNewProdSubtitle(e.target.value)}
                  placeholder="ex: Flacon 500 ml haute performance"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    min={50}
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Initial</label>
                  <input
                    type="number"
                    min={0}
                    value={newProdStock}
                    onChange={e => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seuil Alerte</label>
                  <input
                    type="number"
                    min={1}
                    value={newProdThreshold}
                    onChange={e => setNewProdThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Créer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
