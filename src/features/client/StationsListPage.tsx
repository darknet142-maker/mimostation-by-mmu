import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { OPERATORS, resolveStationBranding } from '@/config/operators';
import { StationCover } from '@/components/station/StationCover';
import { OperatorId, Station } from '@/types';
import {
  MapPin,
  Search,
  Fuel,
  ShoppingCart,
  Coffee,
  Sparkles,
  ChevronRight,
  Heart,
  Phone,
  Clock,
  Navigation,
  Smartphone,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

type ServiceFilter = 'open' | '24h' | 'cafe' | 'wash' | 'gas' | 'favorite';
type SortMode = 'distance' | 'pumps' | 'fuel';

export const StationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { stations, tanks, selectedStationId } = useAppStore(s => ({
    stations: s.stations,
    tanks: s.tanks || [],
    selectedStationId: s.selectedStationId,
  }));

  const initialBrand = searchParams.get('brand') as OperatorId | null;
  const validBrand = OPERATORS.some(o => o.id === initialBrand) ? initialBrand : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<'all' | OperatorId>(validBrand || 'all');
  const [activeServiceFilters, setActiveServiceFilters] = useState<ServiceFilter[]>([]);
  const [sortBy, setSortBy] = useState<SortMode>('distance');

  useEffect(() => {
    const param = searchParams.get('brand') as OperatorId | null;
    if (param && OPERATORS.some(o => o.id === param)) {
      setBrandFilter(param);
    }
  }, [searchParams]);

  const handleBrandFilterChange = (next: 'all' | OperatorId) => {
    setBrandFilter(next);
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'all') {
      nextParams.delete('brand');
    } else {
      nextParams.set('brand', next);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const toggleServiceFilter = (filter: ServiceFilter) => {
    setActiveServiceFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    handleBrandFilterChange('all');
    setActiveServiceFilters([]);
    setSortBy('distance');
  };

  const getStationTanks = (stationId: string) =>
    tanks.filter(t => t.stationId === stationId);

  const filteredStations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const avgFuel = (stationId: string) => {
      const stTanks = tanks.filter(t => t.stationId === stationId);
      if (stTanks.length === 0) return 0;
      return Math.round(stTanks.reduce((acc, t) => acc + t.levelPercent, 0) / stTanks.length);
    };

    const matched = stations.filter(st => {
      const branding = resolveStationBranding(st);
      const brandName = (branding.operator?.name || '').toLowerCase();
      const legalName = (branding.operator?.legalName || '').toLowerCase();

      const matchesSearch =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.address.toLowerCase().includes(q) ||
        st.city.toLowerCase().includes(q) ||
        (st.phone || '').toLowerCase().includes(q) ||
        brandName.includes(q) ||
        legalName.includes(q);

      if (!matchesSearch) return false;

      if (brandFilter !== 'all' && branding.operator?.id !== brandFilter) {
        return false;
      }

      for (const f of activeServiceFilters) {
        if (f === 'open' && (!st.isOpen || (st.status || 'active') !== 'active')) return false;
        if (f === '24h' && !st.isOpen24h) return false;
        if (f === 'cafe' && !st.services.hasCafe) return false;
        if (f === 'wash' && !st.services.hasCarWash) return false;
        if (f === 'gas' && st.services.hasGas === false) return false;
        if (f === 'favorite' && !st.isFavorite) return false;
      }

      return true;
    });

    return [...matched].sort((a, b) => {
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'pumps') return b.services.pumpsAvailable - a.services.pumpsAvailable;
      return avgFuel(b.id) - avgFuel(a.id);
    });
  }, [stations, tanks, searchQuery, brandFilter, activeServiceFilters, sortBy]);

  const buildMapsUrl = (st: Station) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${st.name}, ${st.address}, ${st.city}, ${st.country}`
    )}`;

  const openStationsCount = stations.filter(
    s => s.isOpen && (s.status || 'active') === 'active'
  ).length;

  return (
    <div className="p-4 sm:p-5 space-y-5 bg-[#F8FAFC] min-h-full">
      {/* En-tête répertoire réseau */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#0F172A]">
              Annuaire & État des Stations ({stations.length})
            </h2>
            <p className="text-xs text-slate-500">
              Couverture, contacts directs, disponibilité carburant en cuve et services sur place
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 self-start">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{openStationsCount} station(s) ouverte(s) maintenant</span>
          </div>
        </div>

        {/* Barre de recherche & Tri */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par station, ville, quartier, enseigne ou téléphone..."
              aria-label="Rechercher une station"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl text-xs sm:text-sm border border-transparent focus:bg-white focus:border-[#1668E3] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortMode)}
              aria-label="Trier les stations"
              className="px-3 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 focus:outline-none focus:border-[#1668E3]"
            >
              <option value="distance">Trier : Proximité (km)</option>
              <option value="pumps">Trier : Pompes libres</option>
              <option value="fuel">Trier : Niveau cuves (%)</option>
            </select>
          </div>
        </div>

        {/* Filtre par Enseigne / Marque */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrer par marque">
          <button
            type="button"
            onClick={() => handleBrandFilterChange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              brandFilter === 'all'
                ? 'bg-[#0F172A] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes les marques
          </button>
          {OPERATORS.map(op => {
            const isActive = brandFilter === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => handleBrandFilterChange(op.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isActive
                    ? 'border-[#1668E3] bg-blue-50 text-[#1668E3] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <img src={op.logo} alt="" className="w-4 h-4 object-contain" />
                <span>{op.name}</span>
              </button>
            );
          })}
        </div>

        {/* Filtres rapides par besoin réel */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          {(
            [
              { id: 'open', label: 'Ouvertes' },
              { id: '24h', label: 'Ouvert 24h/24' },
              { id: 'cafe', label: 'Espace Café' },
              { id: 'wash', label: 'Lavage Auto' },
              { id: 'gas', label: 'Gaz Butane' },
              { id: 'favorite', label: 'Favoris ♥' },
            ] as const
          ).map(chip => {
            const active = activeServiceFilters.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleServiceFilter(chip.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                  active
                    ? 'bg-[#1668E3] text-white border-[#1668E3]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}

          {(brandFilter !== 'all' || activeServiceFilters.length > 0 || searchQuery.trim()) && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#1668E3]"
            >
              <RotateCcw className="w-3 h-3" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        <span>{filteredStations.length} station(s) affichée(s)</span>
        <span>
          {sortBy === 'distance'
            ? 'Triées par distance'
            : sortBy === 'pumps'
            ? 'Triées par pompes disponibles'
            : 'Triées par stock carburant'}
        </span>
      </div>

      {filteredStations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-800">
            Aucune station ne correspond à vos critères
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Essayez d&apos;élargir votre recherche ou de réinitialiser les filtres de services et de marque.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1668E3] text-white text-xs font-bold hover:bg-blue-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tout afficher
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredStations.map(st => {
            const isSelected = st.id === selectedStationId;
            const branding = resolveStationBranding(st);
            const brandName = branding.operator?.name || 'StationPro';
            const brandLegal = branding.operator?.legalName || brandName;
            const stationTanks = getStationTanks(st.id);
            const isMaintenance = st.status === 'maintenance';
            const isClosed = st.status === 'closed' || !st.isOpen;

            const handleOpenStation = () => {
              store.setSelectedStation(st.id);
              navigate(`/stations/${st.id}`);
            };

            return (
              <article
                key={st.id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isSelected
                    ? 'border-[#1668E3] ring-2 ring-[#1668E3]/15'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* 1. Couverture Officielle SVG de la Station + Bouton Favori */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleOpenStation}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3]"
                    aria-label={`Ouvrir la fiche de ${st.name}`}
                  >
                    <StationCover
                      coverSrc={branding.cover}
                      logoSrc={branding.logo}
                      stationName={st.name}
                      operatorName={brandName}
                      locationText={`${st.city} • ${st.distanceKm} km`}
                      status={st.status || 'active'}
                      isOpen={st.isOpen}
                      isOpen24h={st.isOpen24h}
                      variant="card"
                      className="rounded-none"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => store.toggleFavoriteStation(st.id)}
                    aria-label={
                      st.isFavorite
                        ? `Retirer ${st.name} des favoris`
                        : `Ajouter ${st.name} aux favoris`
                    }
                    aria-pressed={Boolean(st.isFavorite)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center text-white transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        st.isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-white'
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Corps d'information complet & utile */}
                <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Identité légale + Distance + Badge sélection */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md text-white"
                            style={{ backgroundColor: branding.primaryColor }}
                          >
                            {brandLegal}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-[#1668E3] border border-blue-200 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Ma station active
                            </span>
                          )}
                        </div>
                        {st.description && (
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            {st.description}
                          </p>
                        )}
                      </div>

                      <div className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#1668E3] text-xs font-extrabold shrink-0">
                        {st.distanceKm} km
                      </div>
                    </div>

                    {/* Bloc Contact, Horaires & Paiement */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-[#1668E3] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Adresse
                          </span>
                          <span className="font-semibold text-slate-800 block truncate">
                            {st.address}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {st.city}, {st.country}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Contact direct
                          </span>
                          {st.phone ? (
                            <a
                              href={`tel:${st.phone.replace(/\s+/g, '')}`}
                              className="font-bold text-[#1668E3] hover:underline block"
                            >
                              {st.phone}
                            </a>
                          ) : (
                            <span className="text-slate-500">Standard réseau</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Horaires
                          </span>
                          <span className="font-semibold text-slate-800">
                            {isMaintenance
                              ? 'Travaux / Maintenance'
                              : isClosed
                              ? 'Fermée actuellement'
                              : st.isOpen24h
                              ? 'Ouvert 24h/24 • 7j/7'
                              : '06h00 – 22h00'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Paiements acceptés
                          </span>
                          <span className="font-semibold text-slate-800">
                            {st.advancedSettings?.enableMobileMoney !== false
                              ? 'Airtel / Moov Money • Cash'
                              : 'Espèces & Carte piste'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Disponibilité carburant en cuve (Télémétrie) */}
                    {stationTanks.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-500 uppercase tracking-wide">
                            Réserves en cuve (Temps réel)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {stationTanks.map(tank => {
                            const barTone =
                              tank.status === 'critical'
                                ? 'bg-red-500'
                                : tank.status === 'low'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500';
                            const textTone =
                              tank.status === 'critical'
                                ? 'text-red-700'
                                : tank.status === 'low'
                                ? 'text-amber-700'
                                : 'text-emerald-700';

                            return (
                              <div
                                key={tank.id}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80"
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className="text-slate-700 truncate">{tank.fuelType}</span>
                                  <span className={textTone}>{tank.levelPercent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${barTone}`}
                                    style={{ width: `${Math.min(100, Math.max(4, tank.levelPercent))}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Services cliquables vers sections détaillées */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          store.setSelectedStation(st.id);
                          navigate(`/stations/${st.id}?section=pompes`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-[11px] font-bold transition-colors"
                      >
                        <Fuel className="w-3.5 h-3.5 text-blue-600" />
                        {st.services.pumpsAvailable}/{st.services.pumpsTotal} pompes
                      </button>

                      {st.services.hasBoutique && (
                        <button
                          type="button"
                          onClick={() => {
                            store.setSelectedStation(st.id);
                            navigate(`/stations/${st.id}?section=boutique`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-bold transition-colors"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                          Boutique
                        </button>
                      )}

                      {st.services.hasCafe && (
                        <button
                          type="button"
                          onClick={() => {
                            store.setSelectedStation(st.id);
                            navigate(`/stations/${st.id}?section=cafe`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-900 text-[11px] font-bold transition-colors"
                        >
                          <Coffee className="w-3.5 h-3.5 text-orange-600" />
                          Café
                        </button>
                      )}

                      {st.services.hasCarWash && (
                        <button
                          type="button"
                          onClick={() => {
                            store.setSelectedStation(st.id);
                            navigate(`/stations/${st.id}?section=lavage`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-[11px] font-bold transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                          Lavage
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3. Barre d'actions concrètes : Appeler / Itinéraire / Fiche complète */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    {st.phone && (
                      <a
                        href={`tel:${st.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        Appeler
                      </a>
                    )}

                    <a
                      href={buildMapsUrl(st)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#1668E3]" />
                      Itinéraire
                    </a>

                    <button
                      type="button"
                      onClick={handleOpenStation}
                      className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1668E3] hover:bg-blue-700 text-white text-xs font-extrabold transition-colors shadow-xs"
                    >
                      Voir la station
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
