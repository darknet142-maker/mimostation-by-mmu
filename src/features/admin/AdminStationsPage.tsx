import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Station } from '@/types';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit3,
  Trash2,
  MapPin,
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
  const [newStationCity, setNewStationCity] = useState('Libreville');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationPhone, setNewStationPhone] = useState('+241 011 00 00 00');
  const [newStationPumps, setNewStationPumps] = useState(6);
  const [newStationPrimaryColor, setNewStationPrimaryColor] = useState('#0B4DB3');
  const [newStationSecondaryColor, setNewStationSecondaryColor] = useState('#FFC107');

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

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const newId = `station-${Date.now().toString(36)}`;
    const newStation: Station = {
      id: newId,
      name: newStationName.trim(),
      city: newStationCity,
      country: 'Gabon',
      address: newStationAddress || `${newStationCity}, Gabon`,
      phone: newStationPhone,
      description: `Station-service moderne ${newStationName} à ${newStationCity}.`,
      distanceKm: 2.5,
      isOpen24h: true,
      isOpen: true,
      status: 'active',
      primaryColor: newStationPrimaryColor,
      secondaryColor: newStationSecondaryColor,
      canopyTheme: 'classic-blue',
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
      },
    };

    store.saveStation(newStation);
    setShowAddModal(false);
    setNewStationName('');
    setNewStationAddress('');
  };

  const handleDeleteStation = (id: string, name: string) => {
    if (window.confirm(`Supprimer définitivement la station "${name}" ?`)) {
      store.deleteStation(id);
    }
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
            onChange={e => setStatusFilter(e.target.value as any)}
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
          const isMaint = st.status === 'maintenance';
          const isClosed = st.status === 'closed';

          return (
            <div
              key={st.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Header with Color Banner */}
              <div
                className="h-28 relative p-3 flex flex-col justify-between text-white"
                style={{
                  background: `linear-gradient(135deg, ${st.primaryColor || '#0B4DB3'} 0%, ${
                    st.secondaryColor || '#FFC107'
                  } 120%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-bold">
                    {st.city}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                      isMaint
                        ? 'bg-amber-400 text-amber-950'
                        : isClosed
                        ? 'bg-red-500 text-white'
                        : 'bg-emerald-400 text-emerald-950'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{isMaint ? 'Maintenance' : isClosed ? 'Fermée' : 'Active'}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold drop-shadow-sm">{st.name}</h3>
                  <p className="text-xs text-white/90 flex items-center gap-1 drop-shadow-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{st.address}</span>
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-2">
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
                    onClick={() => {
                      store.setSelectedStation(st.id);
                      navigate('/admin');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Personnaliser</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        store.setSelectedStation(st.id);
                        navigate(`/stations/${st.id}`);
                      }}
                      title="Voir côté Client"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStation(st.id, st.name)}
                      title="Supprimer la station"
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
    </div>
  );
};
