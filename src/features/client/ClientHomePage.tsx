import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { StatusPill } from '@/components/ui/StatusPill';
import { Button } from '@/components/ui/Button';
import { ProductStationAlternativesModal } from '@/components/client/ProductStationAlternativesModal';
import { StationCover } from '@/components/station/StationCover';
import { ASSETS } from '@/config/assets';
import { OPERATORS, resolveStationBranding } from '@/config/operators';
import { Product, Station } from '@/types';
import {
  MapPin,
  Search,
  ChevronRight,
  Shuffle,
  Fuel,
  ShoppingCart,
  Coffee,
  Sparkles,
  QrCode,
  Bell,
  ArrowRight,
  Compass,
} from 'lucide-react';

interface FeaturedProductOffer {
  product: Product;
  station: Station;
}

/** Mélange déterministe basé sur une graine entière pour éviter les sauts non sollicités au re-rendu. */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  let s = seed || 1;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export const ClientHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { stations, products, networkConfig, reservations, alerts } = useAppStore(s => ({
    stations: s.stations || [],
    products: s.products || [],
    networkConfig: s.networkConfig,
    reservations: s.reservations || [],
    alerts: s.alerts || [],
  }));

  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Math.floor(Math.random() * 100000) + 1);
  const [selectedModalOffer, setSelectedModalOffer] = useState<{
    product: Product;
    stationId?: string;
  } | null>(null);

  const openStations = useMemo(
    () =>
      stations.filter(
        s => s.isOpen && (s.status || 'active') === 'active'
      ),
    [stations]
  );

  // Quelques stations à la une (sélection aléatoire diversifiée par marque)
  const featuredStations = useMemo(() => {
    const pool = openStations.length > 0 ? openStations : stations;
    const shuffled = seededShuffle(pool, shuffleSeed);
    const picked: Station[] = [];
    const seenOperators = new Set<string>();

    // Prioriser d'abord 1 station par enseigne différente
    for (const st of shuffled) {
      const opId = resolveStationBranding(st).operator?.id || st.id;
      if (!seenOperators.has(opId)) {
        picked.push(st);
        seenOperators.add(opId);
      }
      if (picked.length >= 3) break;
    }

    // Compléter à 3 si moins de 3 marques disponibles
    for (const st of shuffled) {
      if (picked.length >= 3) break;
      if (!picked.some(p => p.id === st.id)) {
        picked.push(st);
      }
    }
    return picked;
  }, [openStations, stations, shuffleSeed]);

  // Produits en vedette aléatoires répartis sur différentes stations
  const featuredOffers: FeaturedProductOffer[] = useMemo(() => {
    const stationPool = openStations.length > 0 ? openStations : stations;
    const availableProducts = products.filter(p => p.isAvailable && p.stockQuantity > 0);
    const shuffledProducts = seededShuffle(availableProducts, shuffleSeed + 17).slice(0, 6);
    const shuffledStations = seededShuffle(stationPool, shuffleSeed + 31);

    if (shuffledStations.length === 0) return [];

    return shuffledProducts.map((product, index) => ({
      product,
      station: shuffledStations[index % shuffledStations.length],
    }));
  }, [openStations, stations, products, shuffleSeed]);

  const activeReservations = useMemo(
    () =>
      reservations.filter(
        r => r.status === 'pending' || r.status === 'awaiting_payment' || r.status === 'paid'
      ),
    [reservations]
  );

  const latestClientAlert = useMemo(
    () => alerts.find(a => a.audience === 'client') || alerts[0],
    [alerts]
  );

  const getProductAvailability = (product: Product): 'disponible' | 'stock-faible' | 'rupture' => {
    if (!product.isAvailable || product.stockQuantity <= 0) return 'rupture';
    if (product.stockQuantity <= product.minStockThreshold) return 'stock-faible';
    return 'disponible';
  };

  const openQuickService = (service: 'pompes' | 'boutique' | 'cafe' | 'lavage') => {
    const pool = openStations.length > 0 ? openStations : stations;
    let target = pool[0];
    if (service === 'cafe') {
      target = pool.find(s => s.services.hasCafe) || target;
    } else if (service === 'lavage') {
      target = pool.find(s => s.services.hasCarWash) || target;
    } else if (service === 'boutique') {
      target = pool.find(s => s.services.hasBoutique) || target;
    }
    if (target) {
      store.setSelectedStation(target.id);
      navigate(`/stations/${target.id}?section=${service}`);
    } else {
      navigate('/stations');
    }
  };

  const regulatedPrices = [
    {
      id: 'carburant-super',
      label: 'Super Sans Plomb',
      price: networkConfig.fuelPrices.super,
      unit: 'L',
      image: ASSETS.official.carburantsGaz.super,
    },
    {
      id: 'carburant-gazoil',
      label: 'Gasoil Diesel',
      price: networkConfig.fuelPrices.gasoil,
      unit: 'L',
      image: ASSETS.official.carburantsGaz.gasoil,
    },
    {
      id: 'prod-petrole-lampant',
      label: 'Pétrole Lampant',
      price: networkConfig.fuelPrices.petroleLampant,
      unit: 'L',
      image: ASSETS.official.carburantsGaz.petroleLampant,
    },
    {
      id: 'gaz-butane-6kg',
      label: 'Gaz Butane 6 kg',
      price: networkConfig.fuelPrices.gazButane,
      unit: 'bout.',
      image: ASSETS.official.carburantsGaz.gazButane,
    },
  ];

  const handleOpenProductModalById = (productId: string, stationId?: string) => {
    const prod = products.find(p => p.id === productId) || products[0];
    if (prod) {
      setSelectedModalOffer({ product: prod, stationId });
    }
  };

  return (
    <div className="flex flex-col bg-[#F8FAFC] min-h-full pb-6">
      {/* =====================================================================
          1. PRÉSENTATION GLOBALE MULTI-ENSEIGNES (AUCUNE STATION PRÉ-IMPOSÉE)
         ===================================================================== */}
      <section className="bg-gradient-to-br from-[#061838] via-[#0B3A82] to-[#1668E3] text-white px-4 sm:px-6 pt-5 pb-6 rounded-b-3xl shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Réseau Multi-Stations • {openStations.length} station{openStations.length > 1 ? 's' : ''} ouverte{openStations.length > 1 ? 's' : ''} au Gabon
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Carburant, Gaz, Boutique, Café & Lavage sur toutes vos enseignes
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Comparez les disponibilités en temps réel, choisissez votre marque préférée et réservez avec votre QR Code sans attente.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Button
              variant="yellow"
              size="md"
              icon={<Search className="w-4 h-4" />}
              onClick={() => navigate('/stations')}
            >
              Trouver une station
            </Button>
            <Button
              variant="outline-blue"
              size="md"
              className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20"
              icon={<QrCode className="w-4 h-4" />}
              onClick={() => navigate('/reservations')}
            >
              Mes réservations
            </Button>
          </div>
        </div>

        {/* Enseignes partenaires cliquables */}
        <div className="pt-2 border-t border-white/15">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-2">
            Explorer par enseigne partenaire
          </p>
          <div className="flex flex-wrap gap-2">
            {OPERATORS.map(op => {
              const opOpenCount = openStations.filter(
                s => resolveStationBranding(s).operator?.id === op.id
              ).length;
              return (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => navigate(`/stations?brand=${op.id}`)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-[#0F172A] hover:bg-blue-50 text-xs font-extrabold shadow-xs transition-transform active:scale-[0.98]"
                >
                  <img src={op.logo} alt="" className="w-5 h-5 object-contain" />
                  <span>{op.name}</span>
                  {opOpenCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {opOpenCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 space-y-6 mt-5">
        {/* =====================================================================
            2. BANNIÈRE RÉSERVATION ACTIVE OU ALERTE RÉSEAU
           ===================================================================== */}
        {activeReservations.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/reservations')}
            className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 shadow-xs hover:border-amber-400 transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white border border-amber-200 p-1.5 flex items-center justify-center shrink-0">
                <img
                  src={
                    activeReservations[0].productImage ||
                    products.find(p => p.id === activeReservations[0].productId)?.image ||
                    ASSETS.official.services.qrCode
                  }
                  alt={activeReservations[0].productName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                    {activeReservations.length} réservation active
                  </span>
                  <span className="font-mono text-[11px] font-bold text-amber-900">
                    {activeReservations[0].code}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate mt-0.5">
                  {activeReservations[0].productName} ({activeReservations[0].quantity}{' '}
                  {activeReservations[0].unit}) • {activeReservations[0].stationName}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#0B3A82] shrink-0">
              Voir QR <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        )}

        {/* =====================================================================
            3. TARIFS OFFICIELS RÉSEAU (CARBURANTS & GAZ)
           ===================================================================== */}
        <section aria-label="Tarifs officiels en vigueur" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
              Tarifs officiels & produits essentiels
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              Cliquez pour comparer les stations
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {regulatedPrices.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpenProductModalById(item.id)}
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-[#1668E3] hover:shadow-sm transition-all text-left flex items-center gap-2.5"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50/70 border border-blue-100 p-1.5 flex items-center justify-center shrink-0">
                  <img src={item.image} alt={item.label} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">{item.label}</p>
                  <p className="text-sm font-black text-[#1668E3]">
                    {item.price.toLocaleString('fr-FR')} F
                    <span className="text-[10px] font-semibold text-slate-400"> / {item.unit}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* =====================================================================
            4. PRODUITS EN VEDETTE ALÉATOIRES (MULTI-STATIONS)
           ===================================================================== */}
        <section aria-label="Produits en vedette aléatoires" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                Produits en vedette dans nos stations
              </h2>
              <p className="text-xs text-slate-500">
                Sélection aléatoire d&apos;articles disponibles sur l&apos;ensemble du réseau
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShuffleSeed(prev => prev + 97)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-[#1668E3] text-xs font-bold text-[#1668E3] shadow-xs transition-colors shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Mélanger
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredOffers.map(({ product, station }) => {
              const branding = resolveStationBranding(station);
              const availability = getProductAvailability(product);
              return (
                <button
                  key={`${product.id}-${station.id}`}
                  type="button"
                  onClick={() =>
                    setSelectedModalOffer({ product, stationId: station.id })
                  }
                  className="text-left p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#1668E3] hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-slate-200 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <StatusPill type={availability} size="sm" />
                        <span className="text-xs font-black text-[#0B3A82]">
                          {product.priceFCFA.toLocaleString('fr-FR')} F
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-[#0F172A] truncate">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 truncate">
                        {product.subtitle} • Stock : {product.stockQuantity} {product.unit}
                      </p>
                    </div>
                  </div>

                  {/* Station + Marque associée */}
                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={branding.logo}
                        alt={branding.operator?.name || station.name}
                        className="w-5 h-5 rounded object-contain bg-white border border-slate-200 p-0.5 shrink-0"
                      />
                      <span
                        className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded text-white shrink-0"
                        style={{ backgroundColor: branding.primaryColor }}
                      >
                        {branding.operator?.name || 'StationPro'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {station.name}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-[#1668E3] inline-flex items-center gap-0.5 shrink-0">
                      Réserver <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            5. QUELQUES STATIONS À LA UNE (MULTI-MARQUES)
           ===================================================================== */}
        <section aria-label="Stations à la une" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
                Stations à la une
              </h2>
              <p className="text-xs text-slate-500">
                Cliquez sur une station ou directement sur l&apos;un de ses services
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/stations')}
              className="text-xs font-extrabold text-[#1668E3] hover:underline inline-flex items-center gap-1"
            >
              Voir les {stations.length} stations <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {featuredStations.map(st => {
              const branding = resolveStationBranding(st);
              return (
                <div
                  key={st.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-[#1668E3] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <button
                    type="button"
                    onClick={() => {
                      store.setSelectedStation(st.id);
                      navigate(`/stations/${st.id}`);
                    }}
                    className="text-left block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1668E3]"
                  >
                    <StationCover
                      coverSrc={branding.cover}
                      logoSrc={branding.logo}
                      stationName={st.name}
                      operatorName={branding.operator?.name}
                      locationText={`${st.city} • ${st.distanceKm} km`}
                      status={st.status || 'active'}
                      isOpen={st.isOpen}
                      isOpen24h={st.isOpen24h}
                      variant="card"
                      className="rounded-none"
                    />
                  </button>

                  <div className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#1668E3] shrink-0" />
                        <span className="truncate">{st.address}</span>
                      </span>
                      <span className="text-xs font-extrabold text-[#1668E3] shrink-0">
                        {st.distanceKm} km
                      </span>
                    </div>

                    {/* Raccourcis directs vers Pompes / Boutique / Café / Lavage */}
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          store.setSelectedStation(st.id);
                          navigate(`/stations/${st.id}?section=pompes`);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold transition-colors"
                      >
                        <Fuel className="w-3 h-3" />
                        {st.services.pumpsAvailable}/{st.services.pumpsTotal} pompes
                      </button>
                      {st.services.hasBoutique && (
                        <button
                          type="button"
                          onClick={() => {
                            store.setSelectedStation(st.id);
                            navigate(`/stations/${st.id}?section=boutique`);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition-colors"
                        >
                          <ShoppingCart className="w-3 h-3" />
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
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold transition-colors"
                        >
                          <Coffee className="w-3 h-3" />
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
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Lavage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================================
            6. AUTRES SERVICES & RACCOURCIS SUR VOTRE TRAJET
           ===================================================================== */}
        <section aria-label="Autres services du réseau" className="space-y-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#1668E3]" />
            <h2 className="text-base sm:text-lg font-black text-[#0F172A]">
              Autres services disponibles sur le réseau
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => openQuickService('pompes')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-sm text-left space-y-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 p-1.5 flex items-center justify-center">
                <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Pistes & Cuves Live
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vérifiez les pompes libres et simulez votre plein
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openQuickService('boutique')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 hover:shadow-sm text-left space-y-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 p-1.5 flex items-center justify-center">
                <img src={ASSETS.official.services.panierBoutique} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Inventaire Boutique
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gaz, huiles moteur & courses Click & Collect
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openQuickService('cafe')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-sm text-left space-y-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 p-1.5 flex items-center justify-center">
                <img src={ASSETS.official.boutiqueSnack.cafe} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Comptoir Café & Snack
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Commandez expresso, croissants & burgers chauds
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => openQuickService('lavage')}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-cyan-400 hover:shadow-sm text-left space-y-2 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-50 p-1.5 flex items-center justify-center">
                <img src={ASSETS.official.services.lavageAuto} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A]">
                  Lavage Auto & Pneus
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Réservez votre créneau selon le gabarit véhicule
                </p>
              </div>
            </button>
          </div>

          {/* Info réseau / Notifications récentes */}
          {latestClientAlert && (
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-[#1668E3] flex items-center justify-between gap-3 text-left transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1668E3] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#1668E3]">
                      Info Réseau
                    </span>
                    <span className="text-[10px] text-slate-400">{latestClientAlert.time}</span>
                  </div>
                  <p className="text-xs font-bold text-[#0F172A] truncate">
                    {latestClientAlert.title} — {latestClientAlert.subtitle}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          )}
        </section>
      </div>

      {/* Modal Comparateur de stations & réservation */}
      <ProductStationAlternativesModal
        product={selectedModalOffer?.product || null}
        highlightedStationId={selectedModalOffer?.stationId}
        isOpen={Boolean(selectedModalOffer)}
        onClose={() => setSelectedModalOffer(null)}
      />
    </div>
  );
};
