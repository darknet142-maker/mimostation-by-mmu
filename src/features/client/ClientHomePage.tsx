import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { ProductStationAlternativesModal } from '@/components/client/ProductStationAlternativesModal';
import { ASSETS } from '@/config/assets';
import { Product } from '@/types';
import {
  MapPin,
  Crosshair,
  Search,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export const ClientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { stations, selectedStationId, products } = useAppStore(s => ({
    stations: s.stations,
    selectedStationId: s.selectedStationId,
    products: s.products,
  }));

  // Toggle between "Ma position" (Screen 05A) and "Ma station" (Screen 04A)
  const [viewMode, setViewMode] = useState<'position' | 'station'>('station');
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

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

  const handleProductClick = (productId: string) => {
    const prod = products.find(p => p.id === productId) || products[0];
    setSelectedProductForModal(prod);
  };

  // 9 items for Screen 05A (Que recherchez-vous ?)
  const categoryGridItems = [
    { id: 'gaz-butane-6kg', label: 'Gaz Butane', image: ASSETS.products.gazButane },
    { id: 'carburant-gazoil', label: 'Gazoil', image: ASSETS.products.gazoil },
    { id: 'carburant-super', label: 'Super', image: ASSETS.products.super },
    { id: 'huile-moteur-5w40', label: 'Huile Moteur', image: ASSETS.products.huileMoteur },
    { id: 'lave-glace-5l', label: 'Lave-Glace', image: ASSETS.products.laveGlace },
    { id: 'gaz-industriel-35kg', label: 'Gaz Industriel', image: ASSETS.products.gazIndustriel },
    { id: 'eau-minerale-pack', label: 'Eau Minérale', image: ASSETS.products.eauMinerale },
    { id: 'snacks-assortiment', label: 'Snacks', image: ASSETS.products.snacks },
    { id: 'boissons-canettes', label: 'Boissons', image: ASSETS.products.boissons },
  ];

  // 5 items for Screen 04A (Produits disponibles)
  const availableProductsList = [
    {
      id: 'gaz-butane-6kg',
      name: 'Gaz Butane',
      subtitle: 'Bouteille 6 kg',
      image: ASSETS.products.gazButane,
    },
    {
      id: 'carburant-gazoil',
      name: 'Gazoil',
      subtitle: 'Diesel',
      image: ASSETS.products.gazoil,
    },
    {
      id: 'carburant-super',
      name: 'Essence',
      subtitle: 'Super',
      image: ASSETS.products.super,
    },
    {
      id: 'huile-moteur-5w40',
      name: 'Huile Moteur',
      subtitle: '1L / 5L',
      image: ASSETS.products.huileMoteur,
    },
    {
      id: 'graisse-multi',
      name: 'Graisse',
      subtitle: 'Multi-usage',
      image: ASSETS.products.graisse,
    },
  ];

  return (
    <div className="flex flex-col bg-white">
      {/* 3D Gas Station Hero Banner */}
      <div className="relative w-full h-44 sm:h-52 bg-gradient-to-b from-blue-300 to-blue-100 overflow-hidden">
        <img
          src={ASSETS.scenes.clientHero}
          alt="StationPro Service"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main White Content Card overlapping hero */}
      <div className="px-4 py-4 -mt-6 bg-white rounded-t-3xl relative z-10 space-y-4">
        {/* Location selector card */}
        <div className="relative">
          <div
            onClick={() => setStationDropdownOpen(!stationDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#DCE4F0] shadow-station-card cursor-pointer hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1668E3]">
                <MapPin className="w-5 h-5 fill-[#1668E3] text-[#1668E3]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
                  <span>{viewMode === 'station' ? activeStation.name : 'Ma position'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-xs text-slate-500">
                  {activeStation.city}, {activeStation.country}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setViewMode(viewMode === 'station' ? 'position' : 'station');
              }}
              className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"
              title="Basculer vue station / ma position"
            >
              <Crosshair className="w-4 h-4 text-[#1668E3]" />
            </button>
          </div>

          {/* Station dropdown */}
          {stationDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-30 p-2 space-y-1">
              <div className="text-xs font-bold text-slate-400 px-3 py-1 uppercase">
                Choisir une station
              </div>
              {stations.map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    store.setSelectedStation(st.id);
                    setViewMode('station');
                    setStationDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                    st.id === selectedStationId
                      ? 'bg-blue-50 text-[#1668E3] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div>{st.name}</div>
                    <div className="text-xs text-slate-400">{st.distanceKm} km • {st.address}</div>
                  </div>
                  {st.id === selectedStationId && <span className="text-xs bg-[#10B981] text-white px-2 py-0.5 rounded-full">Actuelle</span>}
                </button>
              ))}
              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('position');
                    setStationDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  📍 Mode « Ma position » (Recherche globale)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View mode toggle pill (discreet) */}
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-slate-500">
            {viewMode === 'position' ? 'Catalogue général' : 'Station sélectionnée'}
          </span>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'station' ? 'position' : 'station')}
            className="text-xs font-semibold text-[#1668E3] hover:underline"
          >
            {viewMode === 'position' ? 'Voir ma station' : 'Explorer les catégories'}
          </button>
        </div>

        {/* ================= VIEW 1: QUE RECHERCHEZ-VOUS ? (Screen 05A) ================= */}
        {viewMode === 'position' ? (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
              Que recherchez-vous ?
            </h2>

            {/* 3x3 Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {categoryGridItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleProductClick(item.id)}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-3 flex flex-col items-center justify-between text-center hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-150 min-h-[118px]"
                >
                  <div className="w-12 h-12 flex items-center justify-center mb-1">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="max-h-11 max-w-11 object-contain drop-shadow-xs"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] leading-tight mb-1.5">
                    {item.label}
                  </span>
                  <StatusPill type="disponible" size="sm" />
                </div>
              ))}
            </div>

            {/* Large Blue Action Button (Screen 05A) */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<Search className="w-5 h-5" />}
                onClick={() => navigate('/stations')}
              >
                Trouver une station près de moi
              </Button>
            </div>
          </div>
        ) : (
          /* ================= VIEW 2: PRODUITS DISPONIBLES (Screen 04A) ================= */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Produits disponibles
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/stations/${activeStation.id}`)}
                className="text-xs font-semibold text-[#1668E3] hover:underline"
              >
                Infos station →
              </button>
            </div>

            {/* Vertical list of products with chevron */}
            <div className="space-y-2.5">
              {availableProductsList.map(prod => (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod.id)}
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-[#DCE4F0] hover:border-blue-400 hover:shadow-md cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center p-1 border border-slate-100">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="max-w-10 max-h-10 object-contain drop-shadow-xs"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">{prod.name}</h3>
                      <p className="text-xs text-slate-500">{prod.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusPill type="disponible" size="sm" />
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Alternative Stations Proposal Modal */}
      <ProductStationAlternativesModal
        product={selectedProductForModal}
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
};
