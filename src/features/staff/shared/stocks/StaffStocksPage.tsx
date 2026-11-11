import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ASSETS } from '@/config/assets';
import { Product, ProductCategory } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  ChevronDown,
  Lock,
} from 'lucide-react';

export const StaffStocksPage: React.FC = () => {
  const { products, tanks, stations, selectedStationId, currentEmployee } = useAppStore(s => ({
    products: s.products,
    tanks: s.tanks,
    stations: s.stations,
    selectedStationId: s.selectedStationId,
    currentEmployee: s.currentEmployee,
  }));

  const isGerant = currentEmployee?.role === 'gerant';
  const activeStation = stations.find(s => s.id === selectedStationId) || stations[0];
  const authorName = currentEmployee?.name || 'Responsable Station';

  // Filter products for this station (station-specific or common)
  const stationProducts = products.filter(
    p => !p.stationId || p.stationId === selectedStationId
  );

  const fuelTanks = tanks;
  const gasProducts = stationProducts.filter(p => p.category === 'gaz');
  const boutiqueProducts = stationProducts.filter(p => p.category === 'boutique' || p.category === 'lubrifiants');

  // --- MODAL STATES ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // New product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductSubtitle, setNewProductSubtitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('gaz');
  const [newProductPrice, setNewProductPrice] = useState<number>(6000);
  const [newProductStock, setNewProductStock] = useState<number>(50);
  const [newProductUnit, setNewProductUnit] = useState('bouteille');

  // Edit stock/price form
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editReason, setEditReason] = useState('');

  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    let iconAsset: string = ASSETS.products.gazButane;
    if (newProductCategory === 'carburant') iconAsset = ASSETS.products.super;
    else if (newProductCategory === 'boutique') iconAsset = ASSETS.products.eau50cl;
    else if (newProductCategory === 'lubrifiants') iconAsset = ASSETS.products.huileMoteur;

    store.addProduct(
      {
        name: newProductName.trim(),
        subtitle: newProductSubtitle.trim() || 'Produit certifié StationPro',
        category: newProductCategory,
        priceFCFA: Number(newProductPrice) || 0,
        unit: newProductUnit,
        image: iconAsset,
        stockQuantity: Number(newProductStock) || 0,
        minStockThreshold: 10,
        isAvailable: true,
        stationId: selectedStationId,
      },
      authorName
    );

    setNewProductName('');
    setNewProductSubtitle('');
    setIsAddModalOpen(false);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditPrice(prod.priceFCFA);
    setEditStock(prod.stockQuantity);
    setEditReason('Réapprovisionnement / Régularisation des stocks');
  };

  const handleSaveProductEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    store.updateProduct(
      editingProduct.id,
      {
        priceFCFA: Number(editPrice),
        stockQuantity: Number(editStock),
      },
      authorName,
      editReason.trim() || 'Ajustement de stock en station'
    );

    setEditingProduct(null);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deletingProductId) return;
    store.deleteProduct(
      deletingProductId,
      authorName,
      `Retrait du produit de la ${activeStation.name}`
    );
    setDeletingProductId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Active Station Selector & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#DBE5F1] shadow-xs">
        <div className="relative">
          <div className="text-xs text-slate-400 font-medium mb-1">Station en cours de gestion</div>
          <button
            type="button"
            onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-left hover:bg-blue-100/60 transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#1668E3]" />
            <span className="text-sm font-extrabold text-[#0B3A82]">{activeStation.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {stationDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-2 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                Changer de station
              </div>
              {stations.map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    store.setSelectedStation(st.id);
                    setStationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                    st.id === selectedStationId
                      ? 'bg-[#1668E3] text-white font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{st.name}</span>
                  <span className="text-[10px] opacity-80">{st.city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isGerant ? (
            <Button
              variant="yellow"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Ajouter un produit
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Consultation seule (Édition réservée au Gérant)</span>
            </div>
          )}
        </div>
      </div>

      {/* 1. Stocks Carburants */}
      <SectionCard title={`Stocks Carburants & Gaz Souterrains — ${activeStation.name}`} icon={<img src={ASSETS.official.uiActions.niveauCuve} alt="" className="w-5 h-5 object-contain" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {fuelTanks.map(t => (
            <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-800">{t.fuelType}</h4>
                <StatusPill type="disponible" size="sm" />
              </div>
              <div className="text-xl font-extrabold text-[#0B3A82]">
                {new Intl.NumberFormat('fr-FR').format(t.currentLiters)} L
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div style={{ width: `${t.levelPercent}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
              <div className="text-[10px] text-slate-400">
                Capacité : {new Intl.NumberFormat('fr-FR').format(t.capacityLiters)} L ({t.levelPercent}%)
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 2. Bouteilles de Gaz */}
      <SectionCard
        title={`Bouteilles de Gaz (${gasProducts.length} références)`}
        icon={<img src={ASSETS.official.carburantsGaz.gazButane} alt="" className="w-5 h-5 object-contain" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gasProducts.map(g => (
            <div
              key={g.id}
              className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between hover:border-blue-300 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <img src={g.image} alt="" className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{g.name}</h4>
                  <p className="text-xs text-slate-500">{g.subtitle}</p>
                  <p className="text-xs font-bold text-[#0B3A82] mt-0.5">
                    {new Intl.NumberFormat('fr-FR').format(g.priceFCFA)} FCFA / {g.unit}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-slate-800">{g.stockQuantity}</div>
                  <div className="text-[10px] text-slate-400">en stock ({g.unit})</div>
                </div>
                {isGerant ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(g)}
                      className="p-1.5 rounded-lg bg-blue-50 text-[#1668E3] hover:bg-blue-100"
                      title="Modifier stock ou prix"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProductId(g.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                      title="Supprimer la référence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <StatusPill
                    type={g.stockQuantity <= g.minStockThreshold ? 'danger' : 'disponible'}
                    label={g.stockQuantity <= g.minStockThreshold ? 'Stock faible' : 'Disponible'}
                    size="sm"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 3. Articles Boutique & Lubrifiants */}
      <SectionCard
        title={`Articles Boutique & Lubrifiants (${boutiqueProducts.length} références)`}
        icon={<img src={ASSETS.official.services.panierBoutique} alt="" className="w-5 h-5 object-contain" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boutiqueProducts.map(p => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between hover:border-blue-300 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={p.image} alt="" className="w-10 h-10 object-contain shrink-0" />
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">{p.name}</h5>
                  <p className="text-[10px] text-slate-400">{new Intl.NumberFormat('fr-FR').format(p.priceFCFA)} FCFA</p>
                  <p className="text-[11px] font-extrabold text-[#0B3A82] mt-0.5">{p.stockQuantity} {p.unit}</p>
                </div>
              </div>

              {isGerant ? (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditProduct(p)}
                    className="p-1.5 rounded-lg bg-blue-50 text-[#1668E3] hover:bg-blue-100"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingProductId(p.id)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <StatusPill
                  type={p.stockQuantity <= p.minStockThreshold ? 'danger' : 'disponible'}
                  label={p.stockQuantity <= p.minStockThreshold ? 'Faible' : 'OK'}
                  size="sm"
                />
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ================= MODAL: AJOUTER UN PRODUIT ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un produit au stock"
        subtitle={`Affectation directe à la ${activeStation.name}`}
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du produit</label>
            <input
              type="text"
              required
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              placeholder="Ex: Gaz Butane 12.5 kg, Huile 5W40, Eau minérale..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1668E3] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie</label>
              <select
                value={newProductCategory}
                onChange={e => setNewProductCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#1668E3]"
              >
                <option value="gaz">Gaz Butane</option>
                <option value="carburant">Carburant</option>
                <option value="boutique">Boutique & Épicerie</option>
                <option value="lubrifiants">Lubrifiants & Huiles</option>
                <option value="auto">Accessoires Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unité</label>
              <input
                type="text"
                required
                value={newProductUnit}
                onChange={e => setNewProductUnit(e.target.value)}
                placeholder="bouteille, L, pack, unité"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prix de vente (FCFA)</label>
              <input
                type="number"
                required
                min={0}
                value={newProductPrice}
                onChange={e => setNewProductPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock initial</label>
              <input
                type="number"
                required
                min={0}
                value={newProductStock}
                onChange={e => setNewProductStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Précision</label>
            <input
              type="text"
              value={newProductSubtitle}
              onChange={e => setNewProductSubtitle(e.target.value)}
              placeholder="Ex: Bouteille rechargeable 6 kg"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </Button>
            <Button variant="yellow" size="md" type="submit">
              Enregistrer le produit
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: MODIFIER PRODUIT / STOCK ================= */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title={`Modifier le stock de ${editingProduct?.name}`}
        subtitle="Mise à jour sous traçabilité d'audit certifiée"
      >
        <form onSubmit={handleSaveProductEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau Prix (FCFA)</label>
              <input
                type="number"
                required
                min={0}
                value={editPrice}
                onChange={e => setEditPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau Stock</label>
              <input
                type="number"
                required
                min={0}
                value={editStock}
                onChange={e => setEditStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motif de modification <span className="text-red-500">* (Obligatoire pour l'audit)</span>
            </label>
            <input
              type="text"
              required
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
              placeholder="Ex: Réapprovisionnement hebdomadaire, inventaire de piste..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setEditingProduct(null)}>
              Annuler
            </Button>
            <Button variant="navy" size="md" type="submit">
              Valider la modification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleConfirmDeleteProduct}
        title="Retirer ce produit du stock ?"
        message="Cette action archivera le produit et sera consignée de façon définitive dans le journal d'audit de la station."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
};
