import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { OperatorId, Station } from '@/types';
import { OPERATORS, getOperator, resolveStationBranding } from '@/config/operators';
import { StationCover } from '@/components/station/StationCover';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Trash2,
  Phone,
  Fuel,
} from 'lucide-react';

export const AdminStationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { stations } = useAppStore(s => ({
    stations: s.stations || [],
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'closed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Station modal form
  const [newStationName, setNewStationName] = useState('');
  const [newStationOperatorId, setNewStationOperatorId] = useState<OperatorId>('totalenergies');
  const [newStationCity, setNewStationCity] = useState('Libreville');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationPhone, setNewStationPhone] = useState('+241 011 00 00 00');
  const [newStationPumps, setNewStationPumps] = useState(6);
  const [newStationPrimaryColor, setNewStationPrimaryColor] = useState('#ED1C24');
  const [newStationSecondaryColor, setNewStationSecondaryColor] = useState('#242933');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const filtered = stations.filter(st => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === 'all' || st.city.toLowerCase() === cityFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && st.status !== 'maintenance' && st.status !== 'closed') ||
      st.status === statusFilter;
    return matchesSearch && matchesCity && matchesStatus;
  });

  const handleSelectOperator = (opId: OperatorId) => {
    setNewStationOperatorId(opId);
    const op = getOperator(opId);
    if (op) {
      setNewStationPrimaryColor(op.primaryColor);
      setNewStationSecondaryColor(op.secondaryColor);
    }
  };

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const op = getOperator(newStationOperatorId);
    const newId = `station-${Date.now().toString(36)}`;
    const newStation: Station = {
      id: newId,
      name: newStationName.trim(),
      operatorId: newStationOperatorId,
      city: newStationCity,
      country: 'Gabon',
      address: newStationAddress || `${newStationCity}, Gabon`,
      phone: newStationPhone,
      description: `Station-service ${op?.legalName || ''} — ${newStationName} à ${newStationCity}.`,
      distanceKm: 2.5,
      isOpen24h: true,
      isOpen: true,
      status: 'active',
      primaryColor: newStationPrimaryColor,
      secondaryColor: newStationSecondaryColor,
      canopyTheme: op?.canopyTheme || 'classic-blue',
      bannerStyle: 'image',
      layoutStyle: 'standard',
      services: {
        pumpsTotal: newStationPumps,
        pumpsAvailable: newStationPumps,
        hasBoutique: true,
        hasCafe: true,
        hasCarWash: true,
        hasLubricants: true,
        hasGas: true,
      },
      advancedSettings: {
        enableReservations: true,
        enableMobileMoney: true,
        enableClientNotifications: true,
        airtelMoneyNumber: '+241 074 00 00 00',
        moovMoneyNumber: '+241 066 00 00 00',
      },
    };

    store.saveStation(newStation);
    setShowAddModal(false);
    setNewStationName('');
    setNewStationAddress('');
  };

  const handleDeleteStation = (id: string, name: string) => {
    setPendingDelete({ id, name });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Parc Réseau</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Gestion des Stations-Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Supervisez, personnalisez et administrez les {stations.length} stations du réseau
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nouvelle Station</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, ville..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtres :</span>
          </div>

          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">Toutes les villes</option>
            <option value="libreville">Libreville</option>
            <option value="port-gentil">Port-Gentil</option>
            <option value="franceville">Franceville</option>
            <option value="moanda">Moanda</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'maintenance' | 'closed')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Active</option>
            <option value="maintenance">En Maintenance</option>
            <option value="closed">Fermée</option>
          </select>
        </div>
      </div>

      {/* Grid of Station Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(st => {
          const branding = resolveStationBranding(st);

          return (
            <div
              key={st.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between p-2"
            >
              <StationCover
                coverSrc={branding.cover}
                logoSrc={branding.logo}
                stationName={st.name}
                operatorName={branding.operator?.name}
                locationText={`${st.city} • ${st.address}`}
                status={st.status}
                isOpen={st.isOpen}
                isOpen24h={st.isOpen24h}
                variant="card"
              />

              {/* Card Body */}
              <div className="p-3 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900">{st.name}</h3>
                    {branding.operator && (
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {branding.operator.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Fuel className="w-3.5 h-3.5 text-blue-600" />
                      <span>Distributeurs :</span>
                    </span>
                    <span className="font-bold text-slate-800">
                      {st.services.pumpsAvailable} / {st.services.pumpsTotal} opérationnels
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact :</span>
                    </span>
                    <span className="font-mono text-slate-700">{st.phone || '+241 011 12 34 56'}</span>
                  </div>

                  {/* Services pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {st.services.hasBoutique && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px]">
                        Boutique
                      </span>
                    )}
                    {st.services.hasCafe && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[10px]">
                        Café
                      </span>
                    )}
                    {st.services.hasCarWash && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 font-semibold text-[10px]">
                        Lavage
                      </span>
                    )}
                    {st.services.hasGas && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        Gaz Butane
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      store.setSelectedStation(st.id);
                      navigate('/admin/personnalisation');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Personnaliser</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        store.setSelectedStation(st.id);
                        navigate(`/stations/${st.id}`);
                      }}
                      title="Voir côté Client"
                      aria-label={`Voir ${st.name} côté Client`}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStation(st.id, st.name)}
                      title="Supprimer la station"
                      aria-label={`Supprimer ${st.name}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-slate-900">Ajouter une Station au Réseau</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStation} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enseigne / Opérateur *</label>
                <select
                  value={newStationOperatorId}
                  onChange={e => handleSelectOperator(e.target.value as OperatorId)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold text-slate-800"
                >
                  {OPERATORS.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.legalName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom de la station *</label>
                <input
                  type="text"
                  required
                  value={newStationName}
                  onChange={e => setNewStationName(e.target.value)}
                  placeholder="ex: Station Triomphal"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ville *</label>
                  <select
                    value={newStationCity}
                    onChange={e => setNewStationCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  >
                    <option value="Libreville">Libreville</option>
                    <option value="Port-Gentil">Port-Gentil</option>
                    <option value="Franceville">Franceville</option>
                    <option value="Moanda">Moanda</option>
                    <option value="Oyem">Oyem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de pompes</label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={newStationPumps}
                    onChange={e => setNewStationPumps(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adresse complète</label>
                <input
                  type="text"
                  value={newStationAddress}
                  onChange={e => setNewStationAddress(e.target.value)}
                  placeholder="ex: Rond-point Nzeng-Ayong, Libreville"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Téléphone de contact</label>
                <input
                  type="text"
                  value={newStationPhone}
                  onChange={e => setNewStationPhone(e.target.value)}
                  placeholder="+241 011 00 00 00"
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Couleur Principale</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newStationPrimaryColor}
                      onChange={e => setNewStationPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono">{newStationPrimaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Couleur Secondaire</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newStationSecondaryColor}
                      onChange={e => setNewStationSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono">{newStationSecondaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Créer la station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            store.deleteStation(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
        title="Supprimer la station"
        message={
          pendingDelete
            ? `Supprimer définitivement la station "${pendingDelete.name}" du réseau ?`
            : ''
        }
        confirmLabel="Supprimer définitivement"
        variant="danger"
      />
    </div>
  );
};
