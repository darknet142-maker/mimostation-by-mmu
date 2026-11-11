import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import {
  MapPin,
  Heart,
  Navigation,
  Fuel,
  ShoppingCart,
  Coffee,
  Sparkles,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export const StationDetailPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { stations, selectedStationId } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
  }));

  const station =
    stations.find(s => s.id === stationId) ||
    stations.find(s => s.id === selectedStationId) ||
    stations[0];

  const toggleFavorite = () => {
    store.toggleFavoriteStation(station.id);
  };

  const mainProducts = [
    { id: 'gaz-butane-6kg', name: 'Gaz Butane', subtitle: 'Bouteille 6 kg', image: ASSETS.products.gazButane },
    { id: 'carburant-gazoil', name: 'Gazoil', subtitle: 'Diesel', image: ASSETS.products.gazoil },
    { id: 'carburant-super', name: 'Super', subtitle: 'Sans Plomb', image: ASSETS.products.super },
  ];

  const otherProducts = [
    { id: 'huile-moteur-5w40', name: 'Huile Moteur', subtitle: '1L / 5L', image: ASSETS.products.huileMoteur },
    { id: 'lave-glace-5l', name: 'Lave-Glace', subtitle: '5L', image: ASSETS.products.laveGlace },
  ];

  return (
    <div className="flex flex-col bg-white min-h-full pb-20">
      {/* Station 3D Canopy Banner with Favorite Button */}
      <div className="relative w-full h-48 sm:h-56 bg-slate-800 overflow-hidden">
        <img
          src={ASSETS.scenes.stationFront}
          alt={station.name}
          className="w-full h-full object-cover"
        />
        {/* Heart Favorite Icon (Screen 05B top right) */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-all active:scale-90"
          aria-label={station.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart
            className={`w-5 h-5 ${
              station.isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Station Info Card (overlapping) */}
      <div className="px-4 py-4 -mt-6 bg-white rounded-t-3xl relative z-10 space-y-5">
        <div>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1668E3] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 fill-[#1668E3]" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] leading-tight">
                  {station.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{station.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-50 text-[#1668E3] px-2.5 py-1 rounded-full text-xs font-bold">
              <span>{station.distanceKm} km</span>
              <Navigation className="w-3.5 h-3.5 fill-[#1668E3]" />
            </div>
          </div>

          <div className="mt-3">
            <StatusPill type="ouvert" label="Ouverte • 24h/24" size="sm" />
          </div>
        </div>

        {/* 4 Services in a Row (Screen 05B) */}
        <div className="grid grid-cols-4 gap-2 py-1">
          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <Fuel className="w-6 h-6 text-[#1668E3] mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">
              {station.services.pumpsAvailable}/{station.services.pumpsTotal}
            </span>
            <span className="text-[10px] text-slate-500">Pompes</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <ShoppingCart className="w-6 h-6 text-[#1668E3] mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">Boutique</span>
            <span className="text-[10px] text-slate-500">Ouverte</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <Coffee className="w-6 h-6 text-[#1668E3] mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">Café</span>
            <span className="text-[10px] text-slate-500">Service</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <Sparkles className="w-6 h-6 text-[#1668E3] mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">Lavage</span>
            <span className="text-[10px] text-slate-500">Auto</span>
          </div>
        </div>

        {/* Section: Produits disponibles */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-[#0F172A]">Produits disponibles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {mainProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => navigate(`/stations/${station.id}/reserver/${prod.id}`)}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#DCE4F0] hover:border-blue-400 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center p-1">
                    <img src={prod.image} alt="" className="max-w-8 max-h-8 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{prod.name}</h4>
                    <p className="text-[11px] text-slate-500">{prod.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusPill type="disponible" size="sm" />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Autres produits */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-[#0F172A]">Autres produits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {otherProducts.map(prod => (
              <div
                key={prod.id}
                onClick={() => navigate(`/stations/${station.id}/reserver/${prod.id}`)}
                className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#DCE4F0] hover:border-blue-400 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center p-1">
                    <img src={prod.image} alt="" className="max-w-8 max-h-8 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{prod.name}</h4>
                    <p className="text-[11px] text-slate-500">{prod.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusPill type="disponible" size="sm" />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom Navy Button on mobile, clean inline on desktop */}
      <div className="fixed bottom-16 lg:static lg:bottom-auto left-0 right-0 p-4 lg:p-0 bg-gradient-to-t from-white via-white to-transparent lg:bg-transparent flex justify-center z-40 max-w-md md:max-w-xl lg:max-w-none mx-auto pt-4">
        <Button
          variant="navy"
          size="lg"
          fullWidth
          icon={<Calendar className="w-5 h-5" />}
          onClick={() => navigate(`/stations/${station.id}/reserver/gaz-butane-6kg`)}
        >
          Réserver maintenant
        </Button>
      </div>
    </div>
  );
};

