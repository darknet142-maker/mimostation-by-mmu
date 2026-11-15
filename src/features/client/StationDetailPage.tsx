import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import { StationCanopyPreview } from '@/components/admin/StationCanopyPreview';
import { StationCover } from '@/components/station/StationCover';
import { resolveStationBranding } from '@/config/operators';
import { getLayoutDensity } from '@/config/themes';
import { ProductStationAlternativesModal } from '@/components/client/ProductStationAlternativesModal';
import {
  StationServicesInteractiveHub,
  StationInteractiveSection,
} from '@/components/client/StationServicesInteractiveHub';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { stations, selectedStationId, products, networkConfig } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
    products: s.products || [],
    networkConfig: s.networkConfig,
  }));

  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  const rawSection = searchParams.get('section');
  const activeSection: StationInteractiveSection =
    rawSection === 'pompes' ||
    rawSection === 'boutique' ||
    rawSection === 'cafe' ||
    rawSection === 'lavage'
      ? rawSection
      : 'overview';

  const handleSelectSection = (next: StationInteractiveSection) => {
    const target = activeSection === next ? 'overview' : next;
    if (target === 'overview') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('section');
      setSearchParams(nextParams, { replace: true });
    } else {
      setSearchParams({ section: target }, { replace: true });
    }
  };

  const station =
    stations.find(s => s.id === stationId) ||
    stations.find(s => s.id === selectedStationId) ||
    stations[0];
  const branding = resolveStationBranding(station);
  const density = getLayoutDensity(station.layoutStyle);

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

  const getProductAvailability = (productId: string): 'disponible' | 'stock-faible' | 'rupture' => {
    const prod = products.find(p => p.id === productId);
    if (!prod || !prod.isAvailable || prod.stockQuantity <= 0) return 'rupture';
    if (prod.stockQuantity <= prod.minStockThreshold) return 'stock-faible';
    return 'disponible';
  };

  const handleProductClick = (item: { id: string; name: string; subtitle: string; image: string }) => {
    const fallbackPrice = item.id.includes('super')
      ? (networkConfig?.fuelPrices?.super ?? 700)
      : item.id.includes('gazoil')
      ? (networkConfig?.fuelPrices?.gasoil ?? 650)
      : (networkConfig?.fuelPrices?.gazButane ?? 6000);

    const fullProduct = products.find(p => p.id === item.id) || {
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      priceFCFA: fallbackPrice,
      unit: item.id.includes('gaz') ? 'bouteille(s)' : 'Litre',
      image: item.image,
      category: 'carburant' as const,
      isAvailable: true,
      stockQuantity: 100,
      minStockThreshold: 10,
    };
    setSelectedProductForModal(fullProduct);
  };

  const showCoverBanner = (station.bannerStyle ?? 'cover') === 'cover' || station.bannerStyle === 'image';
  const stationOpenStatus = (station.status || 'active') === 'active' && station.isOpen;
  const stationOpenLabel =
    station.status === 'maintenance'
      ? 'En maintenance'
      : stationOpenStatus
      ? station.isOpen24h
        ? 'Ouverte • 24h/24'
        : 'Ouverte'
      : 'Fermée';

  return (
    <div className="flex flex-col bg-white min-h-full pb-20">
      {/* Bannière : couverture officielle de l'enseigne ou rendu 3D aux couleurs de la station */}
      <div className="relative w-full overflow-hidden bg-slate-900 lg:rounded-2xl">
        {showCoverBanner ? (
          <StationCover
            coverSrc={branding.cover}
            logoSrc={branding.logo}
            stationName={station.name}
            operatorName={branding.operator?.name}
            locationText={`${station.city}, ${station.country}`}
            status={station.status || 'active'}
            isOpen={station.isOpen}
            isOpen24h={station.isOpen24h}
            className="rounded-none lg:rounded-2xl"
          />
        ) : (
          <StationCanopyPreview
            stationName={station.name}
            locationText={`${station.city}, ${station.country}`}
            primaryColor={branding.primaryColor}
            secondaryColor={branding.secondaryColor}
            canopyTheme={station.canopyTheme || 'classic-blue'}
            isOpen={station.isOpen}
            isOpen24h={station.isOpen24h}
            status={station.status || 'active'}
            mode="full"
          />
        )}

        {/* Heart Favorite Icon */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-slate-900/40 hover:bg-slate-900/55 flex items-center justify-center text-white transition-[background-color,transform] duration-150 active:scale-95 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label={station.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={Boolean(station.isFavorite)}
        >
          <Heart
            className={`w-5 h-5 ${
              station.isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Station Info Card */}
      <div className="px-4 py-4 bg-white relative z-10 space-y-5">
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
            <StatusPill
              type={stationOpenStatus ? 'ouvert' : 'ferme'}
              label={stationOpenLabel}
              size="sm"
            />
          </div>
        </div>

        {/* 4 Interactive Services in a Row (Screen 05B) with Official SVG icons */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Services de la station (cliquez pour explorer)
            </span>
            {activeSection !== 'overview' && (
              <button
                type="button"
                onClick={() => handleSelectSection('overview')}
                className="text-[11px] font-bold text-[#1668E3] hover:underline"
              >
                Tout réduire
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
            <button
              type="button"
              aria-pressed={activeSection === 'pompes'}
              onClick={() => handleSelectSection('pompes')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3] ${
                activeSection === 'pompes'
                  ? 'bg-[#1668E3] text-white border-[#1668E3] shadow-md scale-[1.01]'
                  : 'bg-[#F0F5FD] hover:bg-blue-100/70 border-[#DCE8FB] text-[#0F172A]'
              }`}
            >
              <img
                src={ASSETS.official.carburantsGaz.super}
                alt=""
                className="w-7 h-7 object-contain mb-1"
              />
              <span className="text-[11px] font-extrabold">
                {station.services.pumpsAvailable}/{station.services.pumpsTotal} Pompes
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  activeSection === 'pompes' ? 'text-blue-100' : 'text-[#1668E3]'
                }`}
              >
                {activeSection === 'pompes' ? 'Affiché ▼' : 'Voir pistes & cuves →'}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={activeSection === 'boutique'}
              onClick={() => handleSelectSection('boutique')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3] ${
                activeSection === 'boutique'
                  ? 'bg-[#1668E3] text-white border-[#1668E3] shadow-md scale-[1.01]'
                  : 'bg-[#F0F5FD] hover:bg-blue-100/70 border-[#DCE8FB] text-[#0F172A]'
              }`}
            >
              <img
                src={ASSETS.official.services.panierBoutique}
                alt=""
                className="w-7 h-7 object-contain mb-1"
              />
              <span className="text-[11px] font-extrabold">Boutique</span>
              <span
                className={`text-[10px] font-semibold ${
                  activeSection === 'boutique' ? 'text-blue-100' : 'text-[#1668E3]'
                }`}
              >
                {activeSection === 'boutique'
                  ? 'Inventaire ouvert ▼'
                  : `${products.filter(p => p.category !== 'carburant' && p.stockQuantity > 0).length} réf. en stock →`}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={activeSection === 'cafe'}
              onClick={() => handleSelectSection('cafe')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3] ${
                activeSection === 'cafe'
                  ? 'bg-[#1668E3] text-white border-[#1668E3] shadow-md scale-[1.01]'
                  : 'bg-[#F0F5FD] hover:bg-blue-100/70 border-[#DCE8FB] text-[#0F172A]'
              }`}
            >
              <img
                src={ASSETS.official.boutiqueSnack.cafe}
                alt=""
                className="w-7 h-7 object-contain mb-1"
              />
              <span className="text-[11px] font-extrabold">Café & Snack</span>
              <span
                className={`text-[10px] font-semibold ${
                  activeSection === 'cafe' ? 'text-blue-100' : 'text-[#1668E3]'
                }`}
              >
                {activeSection === 'cafe'
                  ? 'Carte ouverte ▼'
                  : station.services.hasCafe
                  ? 'Carte & Click →'
                  : 'Voir carte →'}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={activeSection === 'lavage'}
              onClick={() => handleSelectSection('lavage')}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3] ${
                activeSection === 'lavage'
                  ? 'bg-[#1668E3] text-white border-[#1668E3] shadow-md scale-[1.01]'
                  : 'bg-[#F0F5FD] hover:bg-blue-100/70 border-[#DCE8FB] text-[#0F172A]'
              }`}
            >
              <img
                src={ASSETS.official.services.lavageAuto}
                alt=""
                className="w-7 h-7 object-contain mb-1"
              />
              <span className="text-[11px] font-extrabold">Lavage Auto</span>
              <span
                className={`text-[10px] font-semibold ${
                  activeSection === 'lavage' ? 'text-blue-100' : 'text-[#1668E3]'
                }`}
              >
                {activeSection === 'lavage'
                  ? 'Formules affichées ▼'
                  : station.services.hasCarWash
                  ? 'Tarifs & Créneaux →'
                  : 'Entretien Auto →'}
              </span>
            </button>
          </div>
        </div>

        {/* Interactive Hub for Pompes / Boutique / Café / Lavage */}
        <StationServicesInteractiveHub
          station={station}
          activeSection={activeSection}
          onChangeSection={handleSelectSection}
          onSelectProductForAlternatives={prod => setSelectedProductForModal(prod)}
        />

        {/* Section: Produits disponibles */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-[#0F172A]">Produits disponibles</h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${density.gridGap}`}>
            {mainProducts.map(prod => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleProductClick(prod)}
                className={`w-full text-left flex items-center justify-between ${density.cardPadding} bg-white rounded-xl border border-[#DCE4F0] hover:border-blue-400 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3]`}
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
                  <StatusPill type={getProductAvailability(prod.id)} size="sm" />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section: Autres produits */}
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-[#0F172A]">Autres produits</h3>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${density.gridGap}`}>
            {otherProducts.map(prod => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleProductClick(prod)}
                className={`w-full text-left flex items-center justify-between ${density.cardPadding} bg-white rounded-xl border border-[#DCE4F0] hover:border-blue-400 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3]`}
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
                  <StatusPill type={getProductAvailability(prod.id)} size="sm" />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
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

