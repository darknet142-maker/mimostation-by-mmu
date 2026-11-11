import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { SectionCard } from '@/components/ui/SectionCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ASSETS } from '@/config/assets';
import { Product, Employee, StaffRole, ProductCategory } from '@/types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Package,
  Users,
  FileCheck2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Search,
  Lock,
  DollarSign,
  Layers,
  Fuel,
  TrendingUp,
  MapPin,
  ChevronDown,
} from 'lucide-react';

export const GerantDashboardPage: React.FC = () => {
  const { dailyMetrics, employees, products, alerts, auditLogs, currentEmployee, stations, selectedStationId } = useAppStore(s => ({
    dailyMetrics: s.dailyMetrics,
    employees: s.employees,
    products: s.products,
    alerts: s.alerts,
    auditLogs: s.auditLogs,
    currentEmployee: s.currentEmployee,
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  const safeStations = Array.isArray(stations) && stations.length > 0 ? stations : [
    {
      id: 'station-liberte',
      name: 'Station Liberté',
      address: 'Avenue de l’Indépendance, Libreville',
      city: 'Libreville',
      country: 'Gabon',
      distanceKm: 1.2,
      isOpen24h: true,
      isOpen: true,
      services: { pumpsTotal: 6, pumpsAvailable: 6, hasBoutique: true, hasCafe: true, hasCarWash: true },
    }
  ];
  const activeStation = safeStations.find(s => s.id === selectedStationId) || safeStations[0];
  const safeEmployees = Array.isArray(employees) ? employees : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);

  // Active top tab
  const [activeTab, setActiveTab] = useState<'supervision' | 'stocks' | 'equipes' | 'audit'>('supervision');

  // --- PRODUCT / STOCK MANAGEMENT STATE ---
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // New product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductSubtitle, setNewProductSubtitle] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<ProductCategory>('gaz');
  const [newProductPrice, setNewProductPrice] = useState<number>(6000);
  const [newProductStock, setNewProductStock] = useState<number>(50);
  const [newProductUnit, setNewProductUnit] = useState('bouteille');
  const [newProductStationId, setNewProductStationId] = useState(selectedStationId);

  // Edit stock/price form
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editReason, setEditReason] = useState('');

  // --- EMPLOYEE MANAGEMENT STATE ---
  const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [deletingEmpId, setDeletingEmpId] = useState<string | null>(null);

  // New employee form
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<StaffRole>('pompiste');
  const [newEmpTitle, setNewEmpTitle] = useState('Pompiste de piste');
  const [newEmpPin, setNewEmpPin] = useState('1927');
  const [newEmpStationId, setNewEmpStationId] = useState(selectedStationId);
  const [newEmpAssignedPumps, setNewEmpAssignedPumps] = useState<number[]>([1]);
  const [newEmpAssignedScope, setNewEmpAssignedScope] = useState('Pompe #1 (Piste)');

  // Edit employee form
  const [editEmpTitle, setEditEmpTitle] = useState('');
  const [editEmpPin, setEditEmpPin] = useState('');
  const [editEmpStatus, setEditEmpStatus] = useState<Employee['status']>('active');
  const [editEmpReason, setEditEmpReason] = useState('');
  const [editEmpAssignedPumps, setEditEmpAssignedPumps] = useState<number[]>([]);
  const [editEmpAssignedScope, setEditEmpAssignedScope] = useState('');

  // --- AUDIT TRAIL SEARCH & FILTER STATE ---
  const [auditDateFilter, setAuditDateFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  const activeStaffCount = safeEmployees.filter(e => e.status === 'active').length;

  // Author identity
  const currentAuthorName = currentEmployee?.name || 'Alain OBAME (Gérant)';

  // --- PRODUCT ACTIONS ---
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
        stationId: newProductStationId || selectedStationId,
      },
      currentAuthorName
    );

    // Reset & close
    setNewProductName('');
    setNewProductSubtitle('');
    setIsAddProductOpen(false);
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
      currentAuthorName,
      editReason.trim() || 'Ajustement validé par la direction'
    );

    setEditingProduct(null);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deletingProductId) return;
    store.deleteProduct(
      deletingProductId,
      currentAuthorName,
      'Retrait définitif ordonné par le Gérant'
    );
    setDeletingProductId(null);
  };

  // --- EMPLOYEE ACTIONS ---
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    let avatar: string = ASSETS.avatars.pompiste;
    if (newEmpRole === 'chef-de-piste') avatar = ASSETS.avatars.chefDePiste;
    else if (newEmpRole === 'caissiere') avatar = ASSETS.avatars.caissiere;
    else if (newEmpRole === 'chef-de-poste') avatar = ASSETS.avatars.chefDePoste;

    store.addEmployee(
      {
        name: newEmpName.trim(),
        role: newEmpRole,
        title: newEmpTitle || 'Agent de station',
        subtitle: 'Service station',
        avatar,
        status: 'active',
        stationId: newEmpStationId || selectedStationId,
        pin: newEmpPin || '1927',
        assignedPumps: newEmpRole === 'pompiste' ? newEmpAssignedPumps : undefined,
        assignedScope: newEmpAssignedScope.trim() || undefined,
      },
      currentAuthorName
    );

    setNewEmpName('');
    setNewEmpAssignedPumps([1]);
    setNewEmpAssignedScope('Pompe #1 (Piste)');
    setIsAddEmpOpen(false);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEditingEmp(emp);
    setEditEmpTitle(emp.title);
    setEditEmpPin(emp.pin);
    setEditEmpStatus(emp.status);
    setEditEmpAssignedPumps(emp.assignedPumps || []);
    setEditEmpAssignedScope(emp.assignedScope || '');
    setEditEmpReason('Mise à jour des fonctions et affectations');
  };

  const handleSaveEmployeeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    store.updateEmployee(
      editingEmp.id,
      {
        title: editEmpTitle,
        pin: editEmpPin,
        status: editEmpStatus,
        assignedPumps: editEmpAssignedPumps,
        assignedScope: editEmpAssignedScope.trim() || undefined,
      },
      currentAuthorName,
      editEmpReason.trim() || 'Ajustement des habilitations'
    );

    setEditingEmp(null);
  };

  const handleConfirmDeleteEmployee = () => {
    if (!deletingEmpId) return;
    store.deleteEmployee(
      deletingEmpId,
      currentAuthorName,
      'Révocation d’accès et départ validé'
    );
    setDeletingEmpId(null);
  };

  // --- AUDIT TRAIL FILTERING ---
  const filteredAuditLogs = safeAuditLogs.filter(log => {
    const matchesDate = !auditDateFilter || log.dateFormatted.includes(auditDateFilter);
    const matchesAction = auditActionFilter === 'all' || log.actionType === auditActionFilter;
    const matchesSearch =
      !auditSearchQuery ||
      log.targetName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
      log.hash.toLowerCase().includes(auditSearchQuery.toLowerCase());
    return matchesDate && matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Station Selector Bar for Gérant */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#DBE5F1] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Station active sous supervision</div>
            <div className="text-base font-extrabold text-[#0B3A82] flex items-center gap-2">
              <span>{activeStation.name}</span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Ouverte 24/7
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{activeStation.address}</div>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0B3A82] text-white text-xs font-bold hover:bg-[#1668E3] transition-colors"
          >
            <span>Changer de station</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {stationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-2 space-y-1 text-slate-900">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                Sélectionner une station du réseau
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
                      ? 'bg-blue-50 text-[#1668E3] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div>{st.name}</div>
                    <div className="text-[10px] text-slate-400">{st.city}</div>
                  </div>
                  {st.id === selectedStationId && <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-full">Active</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= GÉRANT TAB NAVIGATION ================= */}
      <div className="bg-white rounded-2xl p-2 border border-[#DBE5F1] shadow-xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('supervision')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'supervision'
              ? 'bg-[#0B3A82] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Vue d'ensemble</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stocks')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'stocks'
              ? 'bg-[#0B3A82] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produits & Stocks ({safeProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('equipes')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'equipes'
              ? 'bg-[#0B3A82] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Équipes & RH ({safeEmployees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'audit'
              ? 'bg-[#0B3A82] text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-[#F7B928]" />
          <span>Journal d'Audit Immuable ({safeAuditLogs.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: VUE D'ENSEMBLE & SUPERVISION ================= */}
      {activeTab === 'supervision' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Financial Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Chiffre d’Affaires Total</span>
                <DollarSign className="w-4 h-4 text-[#0B3A82]" />
              </div>
              <div className="text-2xl font-extrabold text-[#0B3A82] mt-1">
                {new Intl.NumberFormat('fr-FR').format(dailyMetrics.totalRevenueFCFA)} FCFA
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                <TrendingUp className="w-3 h-3" /> +{dailyMetrics.growthPercentVsYesterday}% vs hier
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Revenus Carburant</span>
                <Fuel className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-blue-700 mt-1">
                {new Intl.NumberFormat('fr-FR').format(dailyMetrics.fuelRevenueFCFA)} FCFA
              </div>
              <div className="text-xs text-slate-400 mt-2">75% du CA global</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Revenus Boutique & Gaz</span>
                <Package className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {new Intl.NumberFormat('fr-FR').format(dailyMetrics.boutiqueRevenueFCFA)} FCFA
              </div>
              <div className="text-xs text-slate-400 mt-2">25% du CA global</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Personnel en Poste</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-1">
                {activeStaffCount} / {safeEmployees.length}
              </div>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                Effectif 100% opérationnel
              </span>
            </div>
          </div>

          {/* Grid: Supervision Globale & Alertes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Supervision Globale de la Station" icon={<ShieldCheck className="w-5 h-5 text-[#1668E3]" />}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-700">6 Pompes Carburant</span>
                  </div>
                  <StatusPill type="disponible" label="100% Opérationnelles" size="sm" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-700">Cuves & Stocks Carburants</span>
                  </div>
                  <StatusPill type="disponible" label="Niveaux OK (85%)" size="sm" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-700">Stock Gaz Butane & Boutique</span>
                  </div>
                  <StatusPill type="disponible" label="Stock suffisant" size="sm" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-700">Registre d'audit & Clôture</span>
                  </div>
                  <StatusPill type="active" label="Horodatage SHA-256 actif" size="sm" />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Dernières Alertes d'Exploitation" icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}>
              <div className="space-y-3">
                {safeAlerts.slice(0, 4).map(alt => (
                  <div key={alt.id} className="flex items-start gap-2.5 text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="mt-0.5 shrink-0">
                      {alt.type === 'danger' ? (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-[#0F172A] truncate">{alt.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{alt.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{alt.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ================= TAB 2: GESTION DES PRODUITS & STOCKS ================= */}
      {activeTab === 'stocks' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DBE5F1] shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">Catalogue des Produits & Niveaux de Stock</h3>
              <p className="text-xs text-slate-500">
                Toute modification de prix ou de stock génère immédiatement une entrée d'audit infalsifiable.
              </p>
            </div>
            <Button
              variant="yellow"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddProductOpen(true)}
            >
              Ajouter un produit
            </Button>
          </div>

          {/* Product list table */}
          <div className="bg-white rounded-2xl border border-[#DBE5F1] overflow-hidden shadow-station-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Produit</th>
                    <th className="p-3.5">Catégorie</th>
                    <th className="p-3.5">Prix Unitaire</th>
                    <th className="p-3.5">Stock Disponible</th>
                    <th className="p-3.5">État</th>
                    <th className="p-3.5 text-right">Actions Gérant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeProducts.map(prod => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={prod.image} alt="" className="w-9 h-9 object-contain shrink-0" />
                          <div>
                            <div className="font-bold text-slate-900">{prod.name}</div>
                            <div className="text-[10px] text-slate-400">{prod.subtitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 capitalize text-slate-600 font-medium">
                        {prod.category}
                      </td>
                      <td className="p-3.5 font-bold text-[#0B3A82]">
                        {new Intl.NumberFormat('fr-FR').format(prod.priceFCFA)} FCFA / {prod.unit}
                      </td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-900 text-sm">{prod.stockQuantity}</span>
                        <span className="text-slate-400 text-[10px] ml-1">{prod.unit}</span>
                      </td>
                      <td className="p-3.5">
                        {prod.stockQuantity <= 0 ? (
                          <StatusPill type="danger" label="Épuisé" size="sm" />
                        ) : prod.stockQuantity <= (prod.minStockThreshold || 10) ? (
                          <StatusPill type="danger" label="Stock faible" size="sm" />
                        ) : (
                          <StatusPill type="disponible" label="Stock OK" size="sm" />
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-blue-50 text-[#1668E3] hover:bg-blue-100 transition-colors"
                            title="Modifier prix & stock"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(prod.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Supprimer la référence"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: GESTION DES ÉQUIPES & EMPLOYÉS ================= */}
      {activeTab === 'equipes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DBE5F1] shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">Gestion des Équipes & Habilitations</h3>
              <p className="text-xs text-slate-500">
                Contrôlez les agents, codes PIN de connexion et statuts de service.
              </p>
            </div>
            <Button
              variant="yellow"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddEmpOpen(true)}
            >
              Recruter un agent
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeEmployees.map(emp => (
              <div
                key={emp.id}
                className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || ASSETS.avatars.pompiste}
                      alt={emp.name}
                      className="w-12 h-12 rounded-full border-2 border-slate-200 object-cover bg-blue-500"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{emp.name}</h4>
                      <div className="text-xs text-blue-700 font-semibold">{emp.title}</div>
                      <div className="text-[10px] text-slate-400">Rôle système : {emp.role}</div>
                    </div>
                  </div>
                  <StatusPill
                    type={emp.status === 'active' ? 'active' : 'maintenance'}
                    label={emp.status === 'active' ? 'En poste' : 'En pause'}
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Code PIN :</span>
                  </div>
                  <span className="font-mono font-bold text-[#0B3A82] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {emp.pin || '••••'}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline-blue"
                    size="sm"
                    icon={<Pencil className="w-3.5 h-3.5" />}
                    onClick={() => handleOpenEditEmployee(emp)}
                  >
                    Modifier
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDeletingEmpId(emp.id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="Révoquer / Désactiver l'employé"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: REGISTRE D'AUDIT IMMUABLE (PREUVES À VIE) ================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header certification box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B3A82] to-[#041638] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#F7B928] shrink-0 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>Registre d'Audit Immuable & Horodaté</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    🔒 Preuves infalsifiables à vie
                  </span>
                </h3>
                <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                  Conformément aux exigences de conformité et de transparence, toute création, modification ou suppression
                  de produit, stock, prix ou collaborateur est scellée avec une empreinte cryptographique SHA-256 non altérable.
                </p>
              </div>
            </div>

            <div className="text-left md:text-right shrink-0 bg-white/10 p-3 rounded-xl border border-white/10">
              <div className="text-[10px] text-blue-200 uppercase font-semibold">Total enregistrements</div>
              <div className="text-xl font-extrabold text-[#F7B928]">{auditLogs.length} événements scellés</div>
            </div>
          </div>

          {/* Filter Bar (Date J/M/A, Type, Search) */}
          <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-xs flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearchQuery}
                onChange={e => setAuditSearchQuery(e.target.value)}
                placeholder="Rechercher par motif, cible ou hash..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1668E3]"
              />
            </div>

            {/* Date filter J/M/A */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={auditDateFilter}
                onChange={e => setAuditDateFilter(e.target.value)}
                placeholder="Filtrer par date (ex: 11/11/2026)"
                className="px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1668E3] w-full sm:w-48 font-mono"
              />
              {auditDateFilter && (
                <button
                  type="button"
                  onClick={() => setAuditDateFilter('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action Type filter */}
            <select
              value={auditActionFilter}
              onChange={e => setAuditActionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1668E3] w-full sm:w-auto font-medium"
            >
              <option value="all">Toutes les actions</option>
              <option value="CREATION_PRODUIT">Créations Produits</option>
              <option value="MODIFICATION_STOCK">Modifications Stocks</option>
              <option value="MODIFICATION_PRIX">Modifications Prix</option>
              <option value="SUPPRESSION_PRODUIT">Suppressions Produits</option>
              <option value="AJOUT_EMPLOYE">Recrutements Employés</option>
              <option value="MODIFICATION_EMPLOYE">Modifications Employés</option>
              <option value="SUPPRESSION_EMPLOYE">Suppressions Employés</option>
            </select>
          </div>

          {/* Audit Trail List */}
          <div className="bg-white rounded-2xl border border-[#DBE5F1] overflow-hidden shadow-station-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Date & Heure (J/M/A)</th>
                    <th className="p-3.5">Action & Cible</th>
                    <th className="p-3.5">Auteur</th>
                    <th className="p-3.5">Évolution (Avant → Après)</th>
                    <th className="p-3.5">Motif & Détails</th>
                    <th className="p-3.5 font-mono text-[10px]">Empreinte Scellée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Aucun enregistrement d'audit trouvé pour ces critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 whitespace-nowrap font-semibold text-slate-700">
                          <div className="flex items-center gap-1.5 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>{log.dateFormatted}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-5">{log.timeFormatted}</div>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              log.actionType.includes('SUPPRESSION')
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : log.actionType.includes('CREATION') || log.actionType.includes('AJOUT')
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-[#1668E3] border border-blue-200'
                            }`}
                          >
                            {log.actionType}
                          </span>
                          <div className="font-extrabold text-slate-900 mt-1">{log.targetName}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800">{log.authorName}</div>
                          <div className="text-[10px] text-slate-400">{log.authorRole}</div>
                        </td>

                        <td className="p-3.5 max-w-[200px]">
                          <div className="text-slate-400 line-through truncate text-[11px]">{log.oldValue || '—'}</div>
                          <div className="font-bold text-emerald-600 truncate text-[11px] mt-0.5">
                            → {log.newValue}
                          </div>
                        </td>

                        <td className="p-3.5 max-w-[240px]">
                          <p className="text-slate-600 leading-relaxed line-clamp-2">{log.details}</p>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className="font-mono text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 block truncate max-w-[130px]"
                            title={log.hash}
                          >
                            {log.hash}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: AJOUTER UN PRODUIT ================= */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        title="Ajouter un nouveau produit"
        subtitle="Enregistrement officiel dans le stock de la station"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du produit</label>
            <input
              type="text"
              required
              value={newProductName}
              onChange={e => setNewProductName(e.target.value)}
              placeholder="Ex: Gaz Butane 12.5 kg, Huile 10W40..."
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Station d'affectation</label>
            <select
              value={newProductStationId}
              onChange={e => setNewProductStationId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            >
              {stations.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description courte / Référence</label>
            <input
              type="text"
              value={newProductSubtitle}
              onChange={e => setNewProductSubtitle(e.target.value)}
              placeholder="Ex: Bouteille 12.5 kg rechargeable"
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setIsAddProductOpen(false)}>
              Annuler
            </Button>
            <Button variant="yellow" size="md" type="submit">
              Enregistrer & Archiver
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: MODIFIER PRODUIT / STOCK ================= */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title={`Modifier ${editingProduct?.name}`}
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
              Motif de la modification <span className="text-red-500">* (Obligatoire pour l'audit)</span>
            </label>
            <input
              type="text"
              required
              value={editReason}
              onChange={e => setEditReason(e.target.value)}
              placeholder="Ex: Livraison citerne, réajustement inventaire, décret prix..."
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

      {/* ================= MODAL: AJOUTER UN EMPLOYÉ ================= */}
      <Modal
        isOpen={isAddEmpOpen}
        onClose={() => setIsAddEmpOpen(false)}
        title="Recruter un collaborateur"
        subtitle="Création du profil agent et configuration du code PIN"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom et Prénom</label>
            <input
              type="text"
              required
              value={newEmpName}
              onChange={e => setNewEmpName(e.target.value)}
              placeholder="Ex: Jean Dupont, Marie Obame..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rôle Système</label>
              <select
                value={newEmpRole}
                onChange={e => {
                  const r = e.target.value as StaffRole;
                  setNewEmpRole(r);
                  if (r === 'pompiste') setNewEmpTitle('Pompiste');
                  else if (r === 'chef-de-piste') setNewEmpTitle('Chef de Piste');
                  else if (r === 'caissiere') setNewEmpTitle('Caissière de Boutique');
                  else if (r === 'chef-de-poste') setNewEmpTitle('Chef de Poste');
                  else if (r === 'rayonniste') setNewEmpTitle('Rayonniste');
                  else if (r === 'agent-comptoir') setNewEmpTitle('Agent de Comptoir');
                }}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              >
                <option value="pompiste">Pompiste</option>
                <option value="chef-de-piste">Chef de Piste</option>
                <option value="caissiere">Caissière de Boutique</option>
                <option value="chef-de-poste">Chef de Poste</option>
                <option value="rayonniste">Rayonniste</option>
                <option value="agent-comptoir">Agent de Comptoir</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code PIN (4 chiffres)</label>
              <input
                type="text"
                maxLength={4}
                required
                value={newEmpPin}
                onChange={e => setNewEmpPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-mono text-center tracking-widest font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du poste affiché</label>
              <input
                type="text"
                required
                value={newEmpTitle}
                onChange={e => setNewEmpTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Station d'affectation</label>
              <select
                value={newEmpStationId}
                onChange={e => setNewEmpStationId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              >
                {stations.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Périmètre / Zone de responsabilité</label>
            <input
              type="text"
              value={newEmpAssignedScope}
              onChange={e => setNewEmpAssignedScope(e.target.value)}
              placeholder="Ex: Pompe #1 (Piste), Caisse Boutique, Piste centrale..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {newEmpRole === 'pompiste' && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
              <label className="block text-xs font-bold text-[#0B3A82]">
                Pompe(s) assignée(s) en gestion active exclusive :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(pNum => (
                  <label
                    key={pNum}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      newEmpAssignedPumps.includes(pNum)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newEmpAssignedPumps.includes(pNum)}
                      onChange={e => {
                        if (e.target.checked) {
                          setNewEmpAssignedPumps([...newEmpAssignedPumps, pNum]);
                        } else {
                          setNewEmpAssignedPumps(newEmpAssignedPumps.filter(p => p !== pNum));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Pompe #{pNum}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-blue-600 font-medium">
                Le pompiste aura l'accès opérationnel exclusif à cette pompe (les autres pompes seront pour lui en consultation seule).
              </p>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setIsAddEmpOpen(false)}>
              Annuler
            </Button>
            <Button variant="yellow" size="md" type="submit">
              Enregistrer l'agent
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: MODIFIER EMPLOYÉ ================= */}
      <Modal
        isOpen={Boolean(editingEmp)}
        onClose={() => setEditingEmp(null)}
        title={`Modifier ${editingEmp?.name}`}
        subtitle="Ajustement de l'intitulé de poste ou du code PIN"
      >
        <form onSubmit={handleSaveEmployeeEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Intitulé du poste</label>
            <input
              type="text"
              required
              value={editEmpTitle}
              onChange={e => setEditEmpTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code PIN</label>
              <input
                type="text"
                maxLength={4}
                required
                value={editEmpPin}
                onChange={e => setEditEmpPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm font-mono text-center font-bold tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
              <select
                value={editEmpStatus}
                onChange={e => setEditEmpStatus(e.target.value as Employee['status'])}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
              >
                <option value="active">Actif (En poste)</option>
                <option value="break">En pause</option>
                <option value="offline">Hors service</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Périmètre / Zone de responsabilité</label>
            <input
              type="text"
              value={editEmpAssignedScope}
              onChange={e => setEditEmpAssignedScope(e.target.value)}
              placeholder="Ex: Pompe #1 (Super), Caisse #1, Piste Sud..."
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          {editingEmp?.role === 'pompiste' && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 space-y-2">
              <label className="block text-xs font-bold text-[#0B3A82]">
                Pompe(s) assignée(s) en gestion active exclusive :
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(pNum => (
                  <label
                    key={pNum}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      editEmpAssignedPumps.includes(pNum)
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={editEmpAssignedPumps.includes(pNum)}
                      onChange={e => {
                        if (e.target.checked) {
                          setEditEmpAssignedPumps([...editEmpAssignedPumps, pNum]);
                        } else {
                          setEditEmpAssignedPumps(editEmpAssignedPumps.filter(p => p !== pNum));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span>Pompe #{pNum}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-blue-600 font-medium">
                Cette modification réattribue immédiatement la pompe sur l'interface du pompiste.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Motif RH</label>
            <input
              type="text"
              required
              value={editEmpReason}
              onChange={e => setEditEmpReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-sm"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setEditingEmp(null)}>
              Annuler
            </Button>
            <Button variant="navy" size="md" type="submit">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleConfirmDeleteProduct}
        title="Supprimer la référence produit ?"
        message="Cette action retirera le produit du catalogue et sera consignée de façon définitive dans le registre d'audit immuable."
        confirmLabel="Supprimer & Archiver"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={Boolean(deletingEmpId)}
        onClose={() => setDeletingEmpId(null)}
        onConfirm={handleConfirmDeleteEmployee}
        title="Révoquer cet agent ?"
        message="L'accès au poste sera immédiatement révoqué et cette décision sera scellée dans le journal d'audit de la station."
        confirmLabel="Révoquer l'accès"
        variant="danger"
      />
    </div>
  );
};
