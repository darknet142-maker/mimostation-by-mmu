import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import { StationCanopyPreview } from '@/components/admin/StationCanopyPreview';
import { ProductStationAlternativesModal } from '@/components/client/ProductStationAlternativesModal';
import { Product } from '@/types';
import {
  MapPin,
  Heart,
  Navigation,
  ChevronRight,
  Calendar,
} from 'lucide-react';

export const StationDetailPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { stations, selectedStationId, products } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
    products: s.products || [],
  }));

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

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

  const handleProductClick = (item: { id: string; name: string; subtitle: string; image: string }) => {
    const fullProduct = products.find(p => p.id === item.id) || {
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      priceFCFA: item.id.includes('super') ? 700 : item.id.includes('gazoil') ? 650 : 6000,
      unit: item.id.includes('gaz') ? 'bouteille(s)' : 'Litre',
      image: item.image,
      category: 'carburant' as const,
      isAvailable: true,
      stockQuantity: 100,
      minStockThreshold: 10,
    };
    setSelectedProductForModal(fullProduct);
  };

  return (
    <div className="flex flex-col bg-white min-h-full pb-20">
      {/* Station 3D Canopy Banner with Dynamic Branding */}
      <div className="relative w-full overflow-hidden bg-slate-900">
        <StationCanopyPreview
          stationName={station.name}
          locationText={`${station.city}, ${station.country}`}
          primaryColor={station.primaryColor || '#0B4DB3'}
          secondaryColor={station.secondaryColor || '#FFC107'}
          canopyTheme={station.canopyTheme || 'classic-blue'}
          isOpen={station.isOpen}
          isOpen24h={station.isOpen24h}
          status={station.status || 'active'}
          mode="full"
        />

        {/* Heart Favorite Icon */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-12 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xs flex items-center justify-center text-white transition-all active:scale-90 shadow-md"
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

        {/* 4 Services in a Row (Screen 05B) with Official SVG icons */}
        <div className="grid grid-cols-4 gap-2 py-1">
          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-7 h-7 object-contain mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">
              {station.services.pumpsAvailable}/{station.services.pumpsTotal}
            </span>
            <span className="text-[10px] text-slate-500">Pompes</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <img src={ASSETS.official.services.panierBoutique} alt="" className="w-7 h-7 object-contain mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">Boutique</span>
            <span className="text-[10px] text-slate-500">Ouverte</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <img src={ASSETS.official.boutiqueSnack.cafe} alt="" className="w-7 h-7 object-contain mb-1" />
            <span className="text-[11px] font-bold text-[#0F172A]">Café</span>
            <span className="text-[10px] text-slate-500">Service</span>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#F0F5FD] border border-[#DCE8FB] text-center">
            <img src={ASSETS.official.services.lavageAuto} alt="" className="w-7 h-7 object-contain mb-1" />
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
                onClick={() => handleProductClick(prod)}
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
                onClick={() => handleProductClick(prod)}
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

      {/* Alternative Stations Modal when clicking any product */}
      <ProductStationAlternativesModal
        product={selectedProductForModal}
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
};

