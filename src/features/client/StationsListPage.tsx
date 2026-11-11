import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
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
  const { stations, selectedStationId } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  const [searchQuery, setSearchQuery] = useState('');

  const filteredStations = stations.filter(
    st =>
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4 bg-white min-h-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher une station, un quartier..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#F1F5F9] rounded-xl text-sm border-0 focus:ring-2 focus:ring-[#1668E3] focus:outline-none"
        />
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
          return (
            <div
              key={st.id}
              onClick={() => {
                store.setSelectedStation(st.id);
                navigate(`/stations/${st.id}`);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#1668E3] bg-[#F7FAFF] shadow-sm'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 fill-[#1668E3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">{st.name}</h3>
                      {isSelected && (
                        <span className="text-[10px] font-bold bg-[#1668E3] text-white px-2 py-0.5 rounded-full">
                          Ma station
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{st.address}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    store.toggleFavoriteStation(st.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      st.isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Service Badges */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-blue-600" />
                  {st.services.pumpsAvailable}/{st.services.pumpsTotal} pompes
                </span>
                {st.services.hasBoutique && (
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="w-3.5 h-3.5 text-amber-600" />
                    Boutique
                  </span>
                )}
                {st.services.hasCafe && (
                  <span className="flex items-center gap-1">
                    <Coffee className="w-3.5 h-3.5 text-orange-600" />
                    Café
                  </span>
                )}
                {st.services.hasCarWash && (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    Lavage
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 font-bold text-[#1668E3]">
                  {st.distanceKm} km <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
