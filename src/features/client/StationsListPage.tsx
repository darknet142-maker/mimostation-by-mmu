import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { OPERATORS, resolveStationBranding } from '@/config/operators';
import { OperatorId } from '@/types';
import {
  MapPin,
  Search,
  Fuel,
  ShoppingCart,
  Coffee,
  Sparkles,
  ChevronRight,
  Heart,
} from 'lucide-react';

export const StationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { stations, selectedStationId } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  const initialBrand = searchParams.get('brand') as OperatorId | null;
  const validBrand = OPERATORS.some(o => o.id === initialBrand) ? initialBrand : null;

  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<'all' | OperatorId>(validBrand || 'all');

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

  const filteredStations = stations.filter(st => {
    const branding = resolveStationBranding(st);
    const brandName = branding.operator?.name.toLowerCase() || '';
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brandName.includes(searchQuery.toLowerCase());
    const matchesBrand =
      brandFilter === 'all' || branding.operator?.id === brandFilter;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="p-4 space-y-4 bg-white min-h-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher une station, une marque (Total, OLA, PetroGabon, Engen)..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F1F5F9] rounded-xl text-sm border-0 focus:ring-2 focus:ring-[#1668E3] focus:outline-none"
        />
      </div>

      {/* Brand / Enseigne Filter Bar */}
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

      {/* Stations List: 1 col on mobile, 2 cols on tablet/desktop */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>{filteredStations.length} station(s) trouvée(s)</span>
          <span>À proximité</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

        {filteredStations.map(st => {
          const isSelected = st.id === selectedStationId;
          const branding = resolveStationBranding(st);
          const brandName = branding.operator?.name || 'Réseau StationPro';
          const handleOpenStation = () => {
            store.setSelectedStation(st.id);
            navigate(`/stations/${st.id}`);
          };
          return (
            <div
              key={st.id}
              className={`p-4 rounded-2xl border transition-all ${
                isSelected
                  ? 'border-[#1668E3] bg-[#F7FAFF] shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={handleOpenStation}
                  className="flex-1 flex items-start gap-3 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3]"
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-white border-2 flex items-center justify-center p-1.5 shrink-0 shadow-xs"
                    style={{ borderColor: branding.primaryColor }}
                  >
                    <img
                      src={branding.logo}
                      alt={`Logo ${brandName}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        {brandName}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold bg-[#1668E3] text-white px-2 py-0.5 rounded-full">
                          Ma station
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0F172A] leading-tight">
                      {st.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{st.address}</span>
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => store.toggleFavoriteStation(st.id)}
                  aria-label={st.isFavorite ? `Retirer ${st.name} des favoris` : `Ajouter ${st.name} aux favoris`}
                  aria-pressed={Boolean(st.isFavorite)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-red-500 rounded-xl"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      st.isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Interactive Service Badges (deep-link into each service section) */}
              <div className="w-full flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    store.setSelectedStation(st.id);
                    navigate(`/stations/${st.id}?section=pompes`);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-slate-700 font-semibold transition-colors"
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
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50/70 hover:bg-amber-100 text-slate-700 font-semibold transition-colors"
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
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50/70 hover:bg-orange-100 text-slate-700 font-semibold transition-colors"
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
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-50/70 hover:bg-cyan-100 text-slate-700 font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    Lavage
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenStation}
                  className="ml-auto flex items-center gap-1 font-bold text-[#1668E3] hover:underline"
                >
                  {st.distanceKm} km <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
