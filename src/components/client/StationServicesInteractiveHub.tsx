import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Product, Pump, Station } from '@/types';
import { ASSETS } from '@/config/assets';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  Search,
  Fuel,
  ShoppingCart,
  Coffee,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Minus,
  ArrowRight,
  AlertTriangle,
  X,
  Gauge,
  Car,
  Calculator,
  PackageCheck,
  Store,
} from 'lucide-react';

export type StationInteractiveSection = 'overview' | 'pompes' | 'boutique' | 'cafe' | 'lavage';

interface StationServicesInteractiveHubProps {
  station: Station;
  activeSection: StationInteractiveSection;
  onChangeSection: (section: StationInteractiveSection) => void;
  onSelectProductForAlternatives: (product: Product) => void;
}

interface CafeMenuItem {
  id: string;
  name: string;
  subtitle: string;
  category: 'boissons' | 'viennoiseries' | 'snacking';
  priceFCFA: number;
  prepTimeMin: number;
  image: string;
  calories: string;
}

const CAFE_MENU_ITEMS: CafeMenuItem[] = [
  {
    id: 'cafe-expresso',
    name: 'Expresso Intense Pur Arabica',
    subtitle: 'Torréfaction artisanale — Court ou Allongé',
    category: 'boissons',
    priceFCFA: 1000,
    prepTimeMin: 2,
    image: ASSETS.official.boutiqueSnack.cafe,
    calories: '15 kcal',
  },
  {
    id: 'cafe-cappuccino',
    name: 'Cappuccino & Mousse de Lait',
    subtitle: 'Double shot expresso, lait chaud onctueux',
    category: 'boissons',
    priceFCFA: 1500,
    prepTimeMin: 3,
    image: ASSETS.official.boutiqueSnack.cafe,
    calories: '110 kcal',
  },
  {
    id: 'cafe-jus-naturel',
    name: 'Jus Naturel Ananas-Gingembre 50cl',
    subtitle: 'Pressé à froid, servi très frais',
    category: 'boissons',
    priceFCFA: 1500,
    prepTimeMin: 1,
    image: ASSETS.products.jusNaturel,
    calories: '135 kcal',
  },
  {
    id: 'cafe-eau-minerale',
    name: 'Eau Minérale Glacée 1.5L',
    subtitle: 'Source naturelle fraîche',
    category: 'boissons',
    priceFCFA: 600,
    prepTimeMin: 1,
    image: ASSETS.products.eauMinerale,
    calories: '0 kcal',
  },
  {
    id: 'cafe-croissant',
    name: 'Croissant Pur Beurre Fournée du Matin',
    subtitle: 'Feuilletage doré cuit sur place',
    category: 'viennoiseries',
    priceFCFA: 1000,
    prepTimeMin: 2,
    image: ASSETS.official.boutiqueSnack.viennoiserie,
    calories: '240 kcal',
  },
  {
    id: 'cafe-chocolat',
    name: 'Duo Pain au Chocolat & Tablette Cacao',
    subtitle: 'Chocolat noir intense',
    category: 'viennoiseries',
    priceFCFA: 1500,
    prepTimeMin: 2,
    image: ASSETS.official.boutiqueSnack.chocolat,
    calories: '290 kcal',
  },
  {
    id: 'cafe-sandwich-poulet',
    name: 'Sandwich Club Poulet Rôti & Crudités',
    subtitle: 'Pain de mie toasté, poulet mariné, tomates',
    category: 'snacking',
    priceFCFA: 2500,
    prepTimeMin: 4,
    image: ASSETS.official.boutiqueSnack.sandwich,
    calories: '420 kcal',
  },
  {
    id: 'cafe-burger-station',
    name: 'Burger Gourmet Station & Boisson',
    subtitle: 'Steak bœuf grillé, cheddar fondant, sauce maison',
    category: 'snacking',
    priceFCFA: 4000,
    prepTimeMin: 6,
    image: ASSETS.official.boutiqueSnack.burger,
    calories: '610 kcal',
  },
];

interface WashPackage {
  id: string;
  name: string;
  subtitle: string;
  basePriceFCFA: number;
  durationMin: number;
  image: string;
  features: string[];
  badge?: string;
}

const WASH_PACKAGES: WashPackage[] = [
  {
    id: 'wash-express',
    name: 'Lavage Express Extérieur',
    subtitle: 'Carrosserie haute pression + mousse active',
    basePriceFCFA: 3000,
    durationMin: 15,
    image: ASSETS.official.services.lavageAuto,
    features: [
      'Prélavage mousse active haute densité',
      'Rinçage haute pression carrosserie & passages de roues',
      'Séchage manuel microfibre sans traces',
    ],
  },
  {
    id: 'wash-complet',
    name: 'Lavage Complet Intérieur & Extérieur',
    subtitle: 'Remise à neuf habitacle + carrosserie brillante',
    basePriceFCFA: 5000,
    durationMin: 30,
    image: ASSETS.official.services.lavageAuto,
    badge: 'Le plus choisi',
    features: [
      'Lavage extérieur complet + jantes aluminium',
      'Aspiration intégrale sièges, tapis & coffre',
      'Rénovation plastiques, vitres intérieures & parfum',
    ],
  },
  {
    id: 'wash-vip',
    name: 'Formule VIP Intégrale + Châssis',
    subtitle: 'Protection cire brillante + lavage châssis anti-boue',
    basePriceFCFA: 9000,
    durationMin: 45,
    image: ASSETS.official.services.entretienAuto,
    badge: 'Spécial 4x4 & Route',
    features: [
      'Lavage châssis haute pression (boue, sable, sel)',
      'Lustrage cire hydrophobe & brillant pneus longue durée',
      'Soin complet habitacle + désinfection climatisation',
    ],
  },
  {
    id: 'wash-pneus',
    name: 'Pack Pneumatiques & Mise à Niveau',
    subtitle: 'Sécurité route avant long trajet',
    basePriceFCFA: 1500,
    durationMin: 10,
    image: ASSETS.official.services.pneumatiques,
    features: [
      'Contrôle & gonflage précis des 4 pneus + roue de secours',
      'Appoint lave-glace & contrôle visuel liquide de refroidissement',
      'Vérification essuie-glaces & éclairage',
    ],
  },
];

const VEHICLE_TYPES = [
  { id: 'berline', label: 'Berline / Citadine', multiplier: 1.0, extraMin: 0 },
  { id: 'suv', label: 'SUV / 4×4 / Pick-up', multiplier: 1.4, extraMin: 10 },
  { id: 'utilitaire', label: 'Minibus / Utilitaire', multiplier: 1.6, extraMin: 15 },
] as const;

export const StationServicesInteractiveHub: React.FC<StationServicesInteractiveHubProps> = ({
  station,
  activeSection,
  onChangeSection,
  onSelectProductForAlternatives,
}) => {
  const navigate = useNavigate();
  const { pumps, tanks, products, counterOrders, stations, networkConfig } = useAppStore(s => ({
    pumps: s.pumps,
    tanks: s.tanks,
    products: s.products,
    counterOrders: s.counterOrders,
    stations: s.stations,
    networkConfig: s.networkConfig,
  }));

  // --- 1. POMPES STATE ---
  const [pumpFuelFilter, setPumpFuelFilter] = useState<'all' | 'Super' | 'Gasoil' | 'Pétrole Lampant'>('all');
  const [simProductId, setSimProductId] = useState<string>('prod-super');
  const [simMode, setSimMode] = useState<'fcfa' | 'qty'>('fcfa');
  const [simAmountFCFA, setSimAmountFCFA] = useState<number>(10000);
  const [simQuantity, setSimQuantity] = useState<number>(15);

  // --- 2. BOUTIQUE STATE ---
  const [boutiqueSearch, setBoutiqueSearch] = useState('');
  const [boutiqueCategory, setBoutiqueCategory] = useState<'all' | 'boutique' | 'lubrifiants' | 'auto' | 'gaz'>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [boutiqueCart, setBoutiqueCart] = useState<Record<string, number>>({});
  const [boutiquePayment, setBoutiquePayment] = useState<'place' | 'mobile_money'>('place');
  const [boutiqueConfirmTicket, setBoutiqueConfirmTicket] = useState<{
    code: string;
    itemsSummary: string;
    totalFCFA: number;
    paymentLabel: string;
  } | null>(null);
  const [boutiqueError, setBoutiqueError] = useState<string | null>(null);

  // --- 3. CAFE STATE ---
  const [cafeCategory, setCafeCategory] = useState<'all' | 'boissons' | 'viennoiseries' | 'snacking'>('all');
  const [cafeCart, setCafeCart] = useState<Record<string, number>>({});
  const [cafeCustomerName, setCafeCustomerName] = useState('Client Piste #1');
  const [cafeOrderTicket, setCafeOrderTicket] = useState<{
    orderId: string;
    summary: string;
    totalFCFA: number;
    customer: string;
    prepTimeMin: number;
  } | null>(null);

  // --- 4. LAVAGE STATE ---
  const [selectedVehicleType, setSelectedVehicleType] = useState<'berline' | 'suv' | 'utilitaire'>('berline');
  const [selectedWashId, setSelectedWashId] = useState<string>('wash-complet');
  const [selectedWashSlot, setSelectedWashSlot] = useState<'Maintenant' | 'Dans 30 min' | 'Dans 1h'>('Maintenant');
  const [vehiclePlate, setVehiclePlate] = useState('GA-482-LBV');
  const [washBookingTicket, setWashBookingTicket] = useState<{
    orderId: string;
    packageName: string;
    vehicleLabel: string;
    plate: string;
    slot: string;
    priceFCFA: number;
    durationMin: number;
  } | null>(null);

  // Compute station pumps (with fallback generation if custom station has fewer entries than pumpsTotal)
  const stationPumps: Pump[] = useMemo(() => {
    const existing = pumps.filter(p => p.stationId === station.id);
    const targetCount = Math.max(station.services.pumpsTotal, existing.length);
    const result: Pump[] = [...existing];
    for (let num = 1; num <= targetCount; num++) {
      if (!result.some(p => p.number === num)) {
        const defaultFuel =
          num % 3 === 0 ? 'Pétrole Lampant' : num % 2 === 0 ? 'Gasoil' : 'Super';
        const isAvailable = num <= station.services.pumpsAvailable && station.isOpen;
        result.push({
          id: `synth-${station.id}-${num}`,
          stationId: station.id,
          number: num,
          fuelType: defaultFuel,
          status: isAvailable ? 'available' : 'maintenance',
          litersToday: isAvailable ? 320 + num * 45 : 0,
          assignedEmployeeName: 'Équipe Piste',
        });
      }
    }
    return result.sort((a, b) => a.number - b.number);
  }, [pumps, station.id, station.services.pumpsTotal, station.services.pumpsAvailable, station.isOpen]);

  const filteredPumps = useMemo(() => {
    if (pumpFuelFilter === 'all') return stationPumps;
    return stationPumps.filter(p => p.fuelType === pumpFuelFilter);
  }, [stationPumps, pumpFuelFilter]);

  const stationTanks = useMemo(
    () => tanks.filter(t => t.stationId === station.id),
    [tanks, station.id]
  );

  // Fuel & Gas products for simulator
  const fuelAndGasProducts = useMemo(
    () => products.filter(p => p.category === 'carburant' || p.category === 'gaz'),
    [products]
  );

  const selectedSimProduct = useMemo(
    () => fuelAndGasProducts.find(p => p.id === simProductId) || fuelAndGasProducts[0],
    [fuelAndGasProducts, simProductId]
  );

  // Boutique products
  const boutiqueProducts = useMemo(() => {
    return products.filter(prod => {
      if (prod.category === 'carburant') return false;
      if (boutiqueCategory !== 'all' && prod.category !== boutiqueCategory) return false;
      if (onlyInStock && (!prod.isAvailable || prod.stockQuantity <= 0)) return false;
      if (boutiqueSearch.trim()) {
        const q = boutiqueSearch.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchSub = (prod.subtitle || '').toLowerCase().includes(q);
        if (!matchName && !matchSub) return false;
      }
      return true;
    });
  }, [products, boutiqueCategory, onlyInStock, boutiqueSearch]);

  const boutiqueCartEntries = useMemo(() => {
    return Object.entries(boutiqueCart)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => {
        const product = products.find(p => p.id === productId);
        return product ? { product, qty } : null;
      })
      .filter((item): item is { product: Product; qty: number } => item !== null);
  }, [boutiqueCart, products]);

  const boutiqueCartTotalFCFA = useMemo(
    () => boutiqueCartEntries.reduce((sum, item) => sum + item.product.priceFCFA * item.qty, 0),
    [boutiqueCartEntries]
  );

  // Cafe menu & cart
  const filteredCafeMenu = useMemo(() => {
    if (cafeCategory === 'all') return CAFE_MENU_ITEMS;
    return CAFE_MENU_ITEMS.filter(item => item.category === cafeCategory);
  }, [cafeCategory]);

  const cafeCartEntries = useMemo(() => {
    return Object.entries(cafeCart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = CAFE_MENU_ITEMS.find(m => m.id === id);
        return item ? { item, qty } : null;
      })
      .filter((entry): entry is { item: CafeMenuItem; qty: number } => entry !== null);
  }, [cafeCart]);

  const cafeCartTotalFCFA = useMemo(
    () => cafeCartEntries.reduce((sum, entry) => sum + entry.item.priceFCFA * entry.qty, 0),
    [cafeCartEntries]
  );

  const stationCounterOrders = useMemo(
    () => counterOrders.filter(o => o.stationId === station.id).slice(0, 6),
    [counterOrders, station.id]
  );

  // Car wash calculations
  const activeVehicleObj =
    VEHICLE_TYPES.find(v => v.id === selectedVehicleType) || VEHICLE_TYPES[0];
  const activeWashPkg =
    WASH_PACKAGES.find(w => w.id === selectedWashId) || WASH_PACKAGES[1];
  const computedWashPrice = Math.round(
    (activeWashPkg.basePriceFCFA * activeVehicleObj.multiplier) / 500
  ) * 500;
  const computedWashDuration = activeWashPkg.durationMin + activeVehicleObj.extraMin;

  const autoCareProducts = useMemo(
    () => products.filter(p => p.category === 'auto' || p.category === 'lubrifiants'),
    [products]
  );

  if (activeSection === 'overview') {
    return null;
  }

  // Handlers for Boutique Cart
  const updateBoutiqueQty = (product: Product, delta: number) => {
    setBoutiqueError(null);
    setBoutiqueCart(prev => {
      const current = prev[product.id] || 0;
      const next = Math.max(0, Math.min(product.stockQuantity, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      }
      return { ...prev, [product.id]: next };
    });
  };

  const handleConfirmBoutiqueCart = () => {
    if (boutiqueCartEntries.length === 0) return;
    setBoutiqueError(null);
    const createdCodes: string[] = [];
    const summaryParts: string[] = [];

    for (const entry of boutiqueCartEntries) {
      const res = store.createReservation({
        productId: entry.product.id,
        stationId: station.id,
        quantity: entry.qty,
        paymentMethod: boutiquePayment,
      });
      if (!res.success) {
        setBoutiqueError(res.error);
        return;
      }
      createdCodes.push(res.reservation.code);
      summaryParts.push(`${entry.qty}× ${entry.product.name}`);
    }

    setBoutiqueConfirmTicket({
      code: createdCodes[0] || `BOUTIQUE-${Date.now()}`,
      itemsSummary: summaryParts.join(', '),
      totalFCFA: boutiqueCartTotalFCFA,
      paymentLabel: boutiquePayment === 'mobile_money' ? 'Mobile Money' : 'Paiement sur place',
    });
    setBoutiqueCart({});
  };

  // Handlers for Cafe Cart
  const updateCafeQty = (id: string, delta: number) => {
    setCafeCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleConfirmCafeOrder = () => {
    if (cafeCartEntries.length === 0) return;
    const summary = cafeCartEntries
      .map(entry => `${entry.qty}x ${entry.item.name}`)
      .join(' + ');
    const maxPrep = Math.max(...cafeCartEntries.map(e => e.item.prepTimeMin));
    const customerClean = cafeCustomerName.trim() || 'Client Comptoir';

    store.addCounterOrder({
      item: summary,
      customer: customerClean,
      totalFCFA: cafeCartTotalFCFA,
      stationId: station.id,
    });

    setCafeOrderTicket({
      orderId: `CAFE-${Date.now().toString().slice(-5)}`,
      summary,
      totalFCFA: cafeCartTotalFCFA,
      customer: customerClean,
      prepTimeMin: maxPrep,
    });
    setCafeCart({});
  };

  // Handler for Wash Booking
  const handleBookCarWash = () => {
    const cleanPlate = vehiclePlate.trim().toUpperCase() || 'CLIENT-AUTO';
    const itemDesc = `${activeWashPkg.name} (${activeVehicleObj.label} • ${selectedWashSlot})`;

    store.addCounterOrder({
      item: itemDesc,
      customer: `Véhicule ${cleanPlate}`,
      totalFCFA: computedWashPrice,
      stationId: station.id,
    });

    setWashBookingTicket({
      orderId: `LAV-${Date.now().toString().slice(-5)}`,
      packageName: activeWashPkg.name,
      vehicleLabel: activeVehicleObj.label,
      plate: cleanPlate,
      slot: selectedWashSlot,
      priceFCFA: computedWashPrice,
      durationMin: computedWashDuration,
    });
  };

  const getFuelPumpIcon = (fuelType: Pump['fuelType']) => {
    if (fuelType === 'Super') return ASSETS.official.carburantsGaz.super;
    if (fuelType === 'Gasoil') return ASSETS.official.carburantsGaz.gasoil;
    return ASSETS.official.carburantsGaz.petroleLampant;
  };

  const getFuelUnitPrice = (fuelType: Pump['fuelType']) => {
    if (fuelType === 'Super') return networkConfig.fuelPrices.super;
    if (fuelType === 'Gasoil') return networkConfig.fuelPrices.gasoil;
    return networkConfig.fuelPrices.petroleLampant;
  };

  return (
    <section
      aria-label={`Détails interactifs du service ${activeSection}`}
      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-5 shadow-inner"
    >
      {/* Header bar with section switcher & close button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {activeSection === 'pompes' && (
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </span>
          )}
          {activeSection === 'boutique' && (
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </span>
          )}
          {activeSection === 'cafe' && (
            <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </span>
          )}
          {activeSection === 'lavage' && (
            <span className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
          )}
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
              {activeSection === 'pompes' && `Pistes & Pompes en direct (${stationPumps.length} pompes)`}
              {activeSection === 'boutique' && `Inventaire Boutique & Lubrifiants (${ station.name })`}
              {activeSection === 'cafe' && `Comptoir Café, Viennoiseries & Snacking`}
              {activeSection === 'lavage' && `Centre Lavage Auto, Pneumatiques & Entretien`}
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeSection === 'pompes' && 'État des pistolets par carburant, niveau des cuves et simulateur FCFA / Litres'}
              {activeSection === 'boutique' && 'Stock en temps réel, filtres par rayon et panier Click & Collect immédiat'}
              {activeSection === 'cafe' && 'Commandez votre pause café ou repas chaud et récupérez-le sans file d’attente'}
              {activeSection === 'lavage' && 'Tarifs selon gabarit, réservation de créneau prioritaire et produits d’entretien'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChangeSection('overview')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Retour à la vue d&apos;ensemble
        </button>
      </div>

      {/* =====================================================================
          1. SECTION POMPES & CUVES EN TEMPS RÉEL
         ===================================================================== */}
      {activeSection === 'pompes' && (
        <div className="space-y-5">
          {/* Fuel Type Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'Super', 'Gasoil', 'Pétrole Lampant'] as const).map(fuel => {
                const isActive = pumpFuelFilter === fuel;
                const count =
                  fuel === 'all'
                    ? stationPumps.length
                    : stationPumps.filter(p => p.fuelType === fuel).length;
                return (
                  <button
                    key={fuel}
                    type="button"
                    onClick={() => setPumpFuelFilter(fuel)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#1668E3] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {fuel === 'all' ? 'Toutes les pompes' : fuel} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <span>Super: <strong className="text-[#0F172A]">{networkConfig.fuelPrices.super} F/L</strong></span>
              <span>•</span>
              <span>Gasoil: <strong className="text-[#0F172A]">{networkConfig.fuelPrices.gasoil} F/L</strong></span>
              <span>•</span>
              <span>Pétrole: <strong className="text-[#0F172A]">{networkConfig.fuelPrices.petroleLampant} F/L</strong></span>
            </div>
          </div>

          {/* Interactive Pump Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPumps.map(pump => {
              const isAvail = pump.status === 'available';
              const isBusy = pump.status === 'busy';
              const statusBg = isAvail
                ? 'border-emerald-200 bg-white'
                : isBusy
                ? 'border-blue-200 bg-blue-50/40'
                : 'border-amber-200 bg-amber-50/40';

              const targetProductId =
                pump.fuelType === 'Super'
                  ? 'prod-super'
                  : pump.fuelType === 'Gasoil'
                  ? 'prod-gasoil'
                  : 'prod-petrole-lampant';

              return (
                <div
                  key={pump.id}
                  className={`p-3.5 rounded-2xl border ${statusBg} flex flex-col justify-between gap-3 shadow-xs`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={getFuelPumpIcon(pump.fuelType)}
                          alt={pump.fuelType}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#0F172A]">
                            Pompe #{pump.number}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {pump.fuelType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {pump.assignedEmployeeName || 'Pompiste de garde'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvail
                          ? 'bg-emerald-100 text-emerald-700'
                          : isBusy
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isAvail
                        ? 'Libre • Prête'
                        : isBusy
                        ? 'En service'
                        : pump.status === 'maintenance'
                        ? 'Maintenance'
                        : 'Hors ligne'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Tarif officiel</span>
                      <span className="font-extrabold text-[#0F172A]">
                        {getFuelUnitPrice(pump.fuelType).toLocaleString('fr-FR')} FCFA / L
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">Débit jour</span>
                      <span className="font-bold text-slate-700">
                        {pump.litersToday.toLocaleString('fr-FR')} L servis
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!isAvail && !isBusy}
                    onClick={() => navigate(`/stations/${station.id}/reserver/${targetProductId}`)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors bg-[#1668E3] hover:bg-blue-700 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {isAvail || isBusy ? (
                      <>
                        Réserver sur cette piste <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      'Pompe indisponible'
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Live Tank Levels + Fuel Calculator side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Tank Gauges */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#1668E3]" />
                  Niveau des cuves de la station
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Télémétrie temps réel
                </span>
              </div>

              {stationTanks.length === 0 ? (
                <p className="text-xs text-slate-500">Aucune cuve télémétrée pour cette station.</p>
              ) : (
                <div className="space-y-3">
                  {stationTanks.map(tank => {
                    const barColor =
                      tank.status === 'critical'
                        ? 'bg-red-500'
                        : tank.status === 'low'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500';
                    return (
                      <div key={tank.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{tank.fuelType}</span>
                          <span className="text-slate-500 font-medium">
                            <strong className="text-[#0F172A]">
                              {tank.currentLiters.toLocaleString('fr-FR')} L
                            </strong>{' '}
                            / {tank.capacityLiters.toLocaleString('fr-FR')} L ({tank.levelPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${Math.min(100, Math.max(4, tank.levelPercent))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Interactive Fuel / Gas Simulator */}
            {selectedSimProduct && (
              <div className="bg-white p-4 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-[#1668E3]" />
                    Simulateur & Réservation Rapide
                  </h3>
                  <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSimMode('fcfa')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        simMode === 'fcfa' ? 'bg-white text-[#1668E3] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      En FCFA
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimMode('qty')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        simMode === 'qty' ? 'bg-white text-[#1668E3] shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      En {selectedSimProduct.unit}
                    </button>
                  </div>
                </div>

                {/* Product selector */}
                <div className="flex flex-wrap gap-1.5">
                  {fuelAndGasProducts.map(fp => (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => setSimProductId(fp.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        selectedSimProduct.id === fp.id
                          ? 'border-[#1668E3] bg-blue-50 text-[#1668E3]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <img src={fp.image} alt="" className="w-4 h-4 object-contain" />
                      {fp.name}
                    </button>
                  ))}
                </div>

                {simMode === 'fcfa' ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {[5000, 10000, 15000, 25000, 40000].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSimAmountFCFA(preset)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            simAmountFCFA === preset
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {preset.toLocaleString('fr-FR')} F
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Montant choisi</span>
                        <input
                          type="number"
                          min={500}
                          step={500}
                          value={simAmountFCFA}
                          onChange={e => setSimAmountFCFA(Math.max(0, Number(e.target.value)))}
                          aria-label="Montant en FCFA"
                          className="w-32 font-extrabold text-sm text-[#0F172A] bg-white border border-slate-200 rounded-lg px-2.5 py-1 mt-0.5"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Volume estimé</span>
                        <span className="text-base font-extrabold text-[#1668E3]">
                          {(simAmountFCFA / Math.max(1, selectedSimProduct.priceFCFA)).toFixed(2)}{' '}
                          {selectedSimProduct.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[11px] text-slate-500 block">
                        Quantité ({selectedSimProduct.unit})
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={simQuantity}
                        onChange={e => setSimQuantity(Math.max(1, Number(e.target.value)))}
                        aria-label="Quantité souhaitée"
                        className="w-24 font-extrabold text-sm text-[#0F172A] bg-white border border-slate-200 rounded-lg px-2.5 py-1 mt-0.5"
                      />
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Total à payer</span>
                      <span className="text-base font-extrabold text-[#1668E3]">
                        {(simQuantity * selectedSimProduct.priceFCFA).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/stations/${station.id}/reserver/${selectedSimProduct.id}`)
                  }
                  className="w-full py-2.5 px-4 bg-[#1668E3] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Réserver {selectedSimProduct.name} dans cette station
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          2. SECTION BOUTIQUE & INVENTAIRE INTERACTIF
         ===================================================================== */}
      {activeSection === 'boutique' && (
        <div className="space-y-4">
          {/* Search & Category Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={boutiqueSearch}
                onChange={e => setBoutiqueSearch(e.target.value)}
                placeholder="Rechercher en boutique (huile, eau, gaz, lave-glace, sandwich...)"
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#1668E3] focus:outline-none"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={e => setOnlyInStock(e.target.checked)}
                className="rounded text-[#1668E3] focus:ring-[#1668E3]"
              />
              En stock uniquement
            </label>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: 'Tout l’inventaire' },
                { id: 'boutique', label: 'Boissons & Snacks' },
                { id: 'lubrifiants', label: 'Lubrifiants & Huiles' },
                { id: 'auto', label: 'Entretien Auto' },
                { id: 'gaz', label: 'Bouteilles de Gaz' },
              ] as const
            ).map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setBoutiqueCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  boutiqueCategory === cat.id
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {boutiqueError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {boutiqueError}
            </div>
          )}

          {/* Confirmation Modal / Ticket if Boutique Click & Collect was submitted */}
          {boutiqueConfirmTicket && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Réservation Boutique confirmée !
                </div>
                <p className="text-xs text-emerald-900 font-semibold">
                  Articles : {boutiqueConfirmTicket.itemsSummary}
                </p>
                <p className="text-xs text-emerald-700">
                  Total : <strong>{boutiqueConfirmTicket.totalFCFA.toLocaleString('fr-FR')} FCFA</strong> ({boutiqueConfirmTicket.paymentLabel})
                </p>
                <p className="text-[11px] text-emerald-600">
                  Présentez ce QR Code à la caisse de {station.name} pour retirer vos articles.
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => navigate('/reservations')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800"
                  >
                    Voir mes réservations
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoutiqueConfirmTicket(null)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold"
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shrink-0">
                <QRCodeCanvas value={boutiqueConfirmTicket.code} size={88} />
              </div>
            </div>
          )}

          {/* Inventory Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {boutiqueProducts.map(prod => {
              const statusType =
                !prod.isAvailable || prod.stockQuantity === 0
                  ? 'rupture'
                  : prod.stockQuantity <= prod.minStockThreshold
                  ? 'stock-faible'
                  : 'disponible';
              const qtyInCart = boutiqueCart[prod.id] || 0;

              return (
                <div
                  key={prod.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-3 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-extrabold text-[#0F172A] truncate">
                          {prod.name}
                        </h4>
                        <StatusPill type={statusType} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {prod.subtitle}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-extrabold text-[#1668E3]">
                          {prod.priceFCFA.toLocaleString('fr-FR')} FCFA{' '}
                          <span className="text-[10px] font-normal text-slate-500">
                            / {prod.unit}
                          </span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          En rayon : {prod.stockQuantity} {prod.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectProductForAlternatives(prod)}
                      className="text-[11px] font-bold text-slate-600 hover:text-[#1668E3] underline underline-offset-2"
                    >
                      Comparer stock réseau
                    </button>

                    {statusType !== 'rupture' ? (
                      <div className="flex items-center gap-2">
                        {qtyInCart > 0 ? (
                          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateBoutiqueQty(prod, -1)}
                              aria-label={`Retirer 1 ${prod.name}`}
                              className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-extrabold text-[#1668E3] min-w-[18px] text-center">
                              {qtyInCart}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateBoutiqueQty(prod, 1)}
                              aria-label={`Ajouter 1 ${prod.name}`}
                              disabled={qtyInCart >= prod.stockQuantity}
                              className="w-6 h-6 rounded-lg bg-[#1668E3] text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateBoutiqueQty(prod, 1)}
                            className="px-3 py-1.5 rounded-xl bg-[#1668E3] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Ajouter au panier
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectProductForAlternatives(prod)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100"
                      >
                        Voir stations avec stock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Click & Collect Cart Bar */}
          {boutiqueCartEntries.length > 0 && (
            <div className="sticky bottom-3 bg-[#0F172A] text-white p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Panier Click & Collect Boutique ({boutiqueCartEntries.reduce((s, e) => s + e.qty, 0)} art.)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {boutiqueCartEntries.map(e => `${e.qty}× ${e.product.name}`).join(' • ')}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
                    <input
                      type="radio"
                      name="boutiquePayment"
                      checked={boutiquePayment === 'place'}
                      onChange={() => setBoutiquePayment('place')}
                    />
                    Paiement en caisse
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] cursor-pointer">
                    <input
                      type="radio"
                      name="boutiquePayment"
                      checked={boutiquePayment === 'mobile_money'}
                      onChange={() => setBoutiquePayment('mobile_money')}
                    />
                    Mobile Money
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Total réservé</span>
                  <span className="text-base font-extrabold text-white">
                    {boutiqueCartTotalFCFA.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmBoutiqueCart}
                  className="px-4 py-2.5 rounded-xl bg-[#1668E3] hover:bg-blue-500 text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors"
                >
                  Bloquer mon stock (QR)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          3. SECTION CAFÉ, VIENNOISERIES & SNACKING
         ===================================================================== */}
      {activeSection === 'cafe' && (
        <div className="space-y-4">
          {!station.services.hasCafe && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Le comptoir Café chaud n&apos;est pas actif sur {station.name}.
              </div>
              <p className="text-[11px] text-amber-800">
                Vous pouvez commander les boissons fraîches en Boutique ou basculer vers une station équipée d&apos;un Espace Café :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stations
                  .filter(st => st.services.hasCafe && st.isOpen && st.id !== station.id)
                  .map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        store.setSelectedStation(st.id);
                        navigate(`/stations/${st.id}?section=cafe`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-100 inline-flex items-center gap-1"
                    >
                      <Store className="w-3 h-3" />
                      {st.name} ({st.distanceKm} km)
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'all', label: 'Toute la carte' },
                { id: 'boissons', label: 'Cafés & Boissons Fraîches' },
                { id: 'viennoiseries', label: 'Viennoiseries & Douceurs' },
                { id: 'snacking', label: 'Sandwichs & Burgers Chauds' },
              ] as const
            ).map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCafeCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  cafeCategory === cat.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ticket Confirmation */}
          {cafeOrderTicket && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-emerald-800 font-extrabold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Commande envoyée au Comptoir Café ({cafeOrderTicket.orderId})
                </div>
                <p className="text-xs font-bold text-emerald-900">{cafeOrderTicket.summary}</p>
                <p className="text-xs text-emerald-700">
                  Client : <strong>{cafeOrderTicket.customer}</strong> • Préparation estimée :{' '}
                  <strong>~{cafeOrderTicket.prepTimeMin} min</strong> • Total :{' '}
                  <strong>{cafeOrderTicket.totalFCFA.toLocaleString('fr-FR')} FCFA</strong>
                </p>
                <button
                  type="button"
                  onClick={() => setCafeOrderTicket(null)}
                  className="mt-1 px-3 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold"
                >
                  Nouvelle commande
                </button>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shrink-0">
                <QRCodeCanvas value={cafeOrderTicket.orderId} size={84} />
              </div>
            </div>
          )}

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCafeMenu.map(item => {
              const qty = cafeCart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 hover:border-orange-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-orange-50/60 border border-orange-100 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-[#0F172A] truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs font-extrabold text-orange-600">
                          {item.priceFCFA.toLocaleString('fr-FR')} FCFA
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" /> {item.prepTimeMin} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {qty > 0 ? (
                      <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateCafeQty(item.id, -1)}
                          aria-label={`Retirer 1 ${item.name}`}
                          className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-orange-700 min-w-[16px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCafeQty(item.id, 1)}
                          aria-label={`Ajouter 1 ${item.name}`}
                          className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateCafeQty(item.id, 1)}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Choisir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cafe Order Checkout Box */}
          {cafeCartEntries.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border-2 border-orange-500 shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                  Votre plateau Comptoir ({cafeCartEntries.reduce((s, e) => s + e.qty, 0)} articles)
                </span>
                <p className="text-xs font-semibold text-slate-700">
                  {cafeCartEntries.map(e => `${e.qty}× ${e.item.name}`).join(' + ')}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <label htmlFor="cafe-customer-input" className="text-[11px] font-bold text-slate-500">
                    Votre nom / piste :
                  </label>
                  <input
                    id="cafe-customer-input"
                    type="text"
                    value={cafeCustomerName}
                    onChange={e => setCafeCustomerName(e.target.value)}
                    placeholder="Ex: Client Piste #2"
                    className="px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">À régler au retrait</span>
                  <span className="text-base font-extrabold text-[#0F172A]">
                    {cafeCartTotalFCFA.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmCafeOrder}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold inline-flex items-center gap-1.5"
                >
                  Lancer la préparation
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Live Counter Queue */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Commandes en cours au comptoir ({stationCounterOrders.length})
              </h3>
              <span className="text-[11px] text-slate-500">Mise à jour en direct</span>
            </div>
            {stationCounterOrders.length === 0 ? (
              <p className="text-xs text-slate-500">
                Aucune file d&apos;attente actuellement — service immédiat au comptoir.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stationCounterOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-[#0F172A] truncate">{order.item}</p>
                      <p className="text-[11px] text-slate-500">
                        {order.customer} • {order.time} • {order.totalFCFA.toLocaleString('fr-FR')} F
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        order.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-700'
                          : order.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {order.status === 'ready'
                        ? 'Prêt à retirer'
                        : order.status === 'pending'
                        ? 'En préparation'
                        : 'Servi'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          4. SECTION LAVAGE AUTO, PNEUMATIQUES & ENTRETIEN
         ===================================================================== */}
      {activeSection === 'lavage' && (
        <div className="space-y-5">
          {!station.services.hasCarWash && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                La baie de Lavage Auto haute pression n&apos;est pas installée sur {station.name}.
              </div>
              <p className="text-[11px] text-amber-800">
                Les produits d&apos;entretien auto sont disponibles ci-dessous, ou sélectionnez directement une station avec Lavage Auto :
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stations
                  .filter(st => st.services.hasCarWash && st.isOpen && st.id !== station.id)
                  .map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        store.setSelectedStation(st.id);
                        navigate(`/stations/${st.id}?section=lavage`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-100 inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {st.name} ({st.distanceKm} km)
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Step 1: Vehicle Size Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-600" />
                1. Sélectionnez le gabarit de votre véhicule
              </h3>
              <span className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full">
                Baie Lavage #1 disponible
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {VEHICLE_TYPES.map(vType => {
                const isSelected = selectedVehicleType === vType.id;
                return (
                  <button
                    key={vType.id}
                    type="button"
                    onClick={() => setSelectedVehicleType(vType.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-cyan-600 bg-cyan-50/70 ring-2 ring-cyan-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0F172A]">{vType.label}</span>
                      <span className="text-[10px] font-bold text-cyan-700 bg-white px-2 py-0.5 rounded-md border border-cyan-200">
                        ×{vType.multiplier.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {vType.extraMin === 0
                        ? 'Durée standard'
                        : `+${vType.extraMin} min de soin approfondi`}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Wash Packages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WASH_PACKAGES.map(pkg => {
              const isSelected = selectedWashId === pkg.id;
              const pkgPrice =
                Math.round((pkg.basePriceFCFA * activeVehicleObj.multiplier) / 500) * 500;
              const pkgDuration = pkg.durationMin + activeVehicleObj.extraMin;

              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedWashId(pkg.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'border-cyan-600 bg-white ring-2 ring-cyan-600/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-cyan-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 p-2 flex items-center justify-center shrink-0">
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-extrabold text-[#0F172A]">{pkg.name}</h4>
                            {pkg.badge && (
                              <span className="text-[10px] font-bold bg-cyan-600 text-white px-2 py-0.5 rounded-full">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{pkg.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1 pt-1">
                      {pkg.features.map(feat => (
                        <li
                          key={feat}
                          className="text-[11px] text-slate-600 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 w-full">
                    <span className="text-[11px] font-semibold text-slate-500 inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-600" /> ~{pkgDuration} min
                    </span>
                    <span className="text-sm font-extrabold text-cyan-700">
                      {pkgPrice.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step 3: Slot Booking & QR Ticket */}
          <div className="bg-white p-4 rounded-2xl border border-cyan-200 space-y-3">
            <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
              2. Réserver mon passage prioritaire en baie de lavage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Créneau souhaité
                </label>
                <div className="flex gap-1.5">
                  {(['Maintenant', 'Dans 30 min', 'Dans 1h'] as const).map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedWashSlot(slot)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border ${
                        selectedWashSlot === slot
                          ? 'bg-cyan-600 text-white border-cyan-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="wash-plate-input"
                  className="text-[11px] font-bold text-slate-500 block mb-1"
                >
                  Immatriculation ou Nom
                </label>
                <input
                  id="wash-plate-input"
                  type="text"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value)}
                  placeholder="Ex: GA-482-LBV"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-slate-50"
                />
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleBookCarWash}
                  className="w-full py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Valider ({computedWashPrice.toLocaleString('fr-FR')} FCFA)
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {washBookingTicket && (
              <div className="mt-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-emerald-800 font-extrabold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Ticket Lavage réservé ({washBookingTicket.orderId})
                  </div>
                  <p className="text-xs font-bold text-emerald-900">
                    {washBookingTicket.packageName} • {washBookingTicket.vehicleLabel}
                  </p>
                  <p className="text-xs text-emerald-700">
                    Véhicule : <strong>{washBookingTicket.plate}</strong> • Créneau :{' '}
                    <strong>{washBookingTicket.slot}</strong> • Durée :{' '}
                    <strong>~{washBookingTicket.durationMin} min</strong> • Tarif :{' '}
                    <strong>{washBookingTicket.priceFCFA.toLocaleString('fr-FR')} FCFA</strong>
                  </p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-200 shrink-0">
                  <QRCodeCanvas value={washBookingTicket.orderId} size={80} />
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Auto Care Products in Stock */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
              Produits Entretien Auto & Lubrifiants en stock ({autoCareProducts.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {autoCareProducts.map(prod => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{prod.name}</p>
                      <p className="text-[11px] font-extrabold text-[#1668E3]">
                        {prod.priceFCFA.toLocaleString('fr-FR')} F • Stock: {prod.stockQuantity}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/stations/${station.id}/reserver/${prod.id}`)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-[#1668E3] text-white text-[11px] font-bold shrink-0 transition-colors"
                  >
                    Réserver
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
