import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Station } from '@/types';
import { ASSETS } from '@/config/assets';
import {
  StationCanopyPreview,
  CANOPY_THEMES,
} from '@/components/admin/StationCanopyPreview';
import {
  Store,
  MapPin,
  Phone,
  Search,
  Upload,
  RotateCcw,
  Check,
  TrendingUp,
  Users,
  ChevronRight,
  Palette,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { stations } = useAppStore(s => ({
    stations: s.stations || [],
  }));

  // Selected station being edited (default: Station Liberté)
  const [selectedStationId, setSelectedStationId] = useState<string>('station-liberte');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form editable states
  const [name, setName] = useState('Station Liberté');
  const [code, setCode] = useState('ST-LBV-01');
  const [locationText, setLocationText] = useState('Libreville, Gabon');
  const [phone, setPhone] = useState('+241 011 12 34 56');
  const [emergencyPhone, setEmergencyPhone] = useState('+241 077 00 11 22');
  const [email, setEmail] = useState('contact.liberte@stationpro.ga');
  const [managerName, setManagerName] = useState('Alain OBAME');
  const [description, setDescription] = useState('Votre station de confiance à Libreville.');
  const [primaryColor, setPrimaryColor] = useState('#0B4DB3');
  const [secondaryColor, setSecondaryColor] = useState('#FFC107');
  const [canopyTheme, setCanopyTheme] = useState<Station['canopyTheme']>('classic-blue');
  const [bannerStyle, setBannerStyle] = useState<'canopy' | 'front' | 'city' | 'gradient'>('canopy');
  const [layoutStyle, setLayoutStyle] = useState<'standard' | 'compact' | 'dense'>('standard');
  const [status, setStatus] = useState<Station['status']>('active');
  const [isOpen24h, setIsOpen24h] = useState(true);
  const [openingTime, setOpeningTime] = useState('06:00');
  const [closingTime, setClosingTime] = useState('23:00');

  // Offered services 360°
  const [services, setServices] = useState({
    carburants: true,
    gaz: true,
    lubrifiants: true,
    boutique: true,
    cafe: true,
    lavage: true,
    pneumatiques: true,
    mecanique: false,
  });

  // Advanced settings switches 360°
  const [advancedSettings, setAdvancedSettings] = useState({
    enableReservations: true,
    enableMobileMoney: true,
    enableClientNotifications: true,
    reservationDurationMin: 30,
    airtelMoneyNumber: '+241 077 12 34 56',
    moovMoneyNumber: '+241 066 98 76 54',
    minStockAlertPercent: 20,
  });

  // Expandable 360° details drawer
  const [showDeep360Settings, setShowDeep360Settings] = useState(false);

  // Active theme tab on right panel
  const [activeThemeTab, setActiveThemeTab] = useState<'theme' | 'banner' | 'layout'>('theme');

  // Load selected station data when changing station
  useEffect(() => {
    const current = stations.find(s => s.id === selectedStationId) || stations[0];
    if (current) {
      setName(current.name);
      setCode(current.code || `ST-${current.city.slice(0, 3).toUpperCase()}-01`);
      setLocationText(`${current.city}, ${current.country}`);
      setPhone(current.phone || '+241 011 12 34 56');
      setEmail(current.email || `contact.${current.id}@stationpro.ga`);
      setManagerName(current.managerName || 'Alain OBAME');
      setDescription(current.description || 'Votre station de confiance.');
      setPrimaryColor(current.primaryColor || '#0B4DB3');
      setSecondaryColor(current.secondaryColor || '#FFC107');
      setCanopyTheme(current.canopyTheme || 'classic-blue');
      setLayoutStyle(current.layoutStyle || 'standard');
      setStatus(current.status || 'active');
      setIsOpen24h(current.isOpen24h ?? true);
      setServices({
        carburants: true,
        gaz: current.services.hasGas !== false,
        lubrifiants: current.services.hasLubricants !== false,
        boutique: current.services.hasBoutique,
        cafe: current.services.hasCafe,
        lavage: current.services.hasCarWash,
        pneumatiques: current.services.hasTyreService !== false,
        mecanique: current.services.hasMechanic === true,
      });
      setAdvancedSettings({
        enableReservations: current.advancedSettings?.enableReservations ?? true,
        enableMobileMoney: current.advancedSettings?.enableMobileMoney ?? true,
        enableClientNotifications: current.advancedSettings?.enableClientNotifications ?? true,
        reservationDurationMin: current.advancedSettings?.reservationDurationMin || 30,
        airtelMoneyNumber: current.advancedSettings?.airtelMoneyNumber || '+241 077 12 34 56',
        moovMoneyNumber: current.advancedSettings?.moovMoneyNumber || '+241 066 98 76 54',
        minStockAlertPercent: current.advancedSettings?.minStockAlertPercent || 20,
      });
    }
  }, [selectedStationId, stations]);

  // Handle Save 360°
  const handleSaveStation = () => {
    const cityPart = locationText.split(',')[0]?.trim() || 'Libreville';
    const countryPart = locationText.split(',')[1]?.trim() || 'Gabon';

    const updated: Station = {
      id: selectedStationId,
      name,
      code,
      address: locationText,
      city: cityPart,
      country: countryPart,
      phone,
      email,
      managerName,
      description,
      distanceKm: 1.2,
      isOpen24h,
      isOpen: status === 'active',
      status,
      primaryColor,
      secondaryColor,
      canopyTheme,
      layoutStyle,
      services: {
        pumpsTotal: 6,
        pumpsAvailable: status === 'active' ? 6 : 0,
        hasBoutique: services.boutique,
        hasCafe: services.cafe,
        hasCarWash: services.lavage,
        hasLubricants: services.lubrifiants,
        hasGas: services.gaz,
        hasTyreService: services.pneumatiques,
        hasMechanic: services.mecanique,
      },
      advancedSettings: {
        ...advancedSettings,
        openingTime,
        closingTime,
      },
    };

    store.saveStation(updated);
    setSaveSuccessMsg(`Station "${name}" et ses paramètres 360° enregistrés avec succès !`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Handle Reset to original fixtures
  const handleReset = () => {
    const original = stations.find(s => s.id === selectedStationId);
    if (original) {
      setName(original.name);
      setLocationText(`${original.city}, ${original.country}`);
      setPhone(original.phone || '+241 011 12 34 56');
      setDescription(original.description || '');
      setPrimaryColor(original.primaryColor || '#0B4DB3');
      setSecondaryColor(original.secondaryColor || '#FFC107');
      setCanopyTheme(original.canopyTheme || 'classic-blue');
      setStatus(original.status || 'active');
      setSaveSuccessMsg('Paramètres réinitialisés.');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Filtered stations for right panel
  const filteredStations = stations.filter(st => {
    if (cityFilter === 'all') return true;
    return st.city.toLowerCase() === cityFilter.toLowerCase();
  });

  // Color preset dots from screenshot
  const PRESET_COLORS = [
    { label: 'Bleu Royal', hex: '#0B4DB3' },
    { label: 'Or / Jaune', hex: '#FFC107' },
    { label: 'Violet', hex: '#8B5CF6' },
    { label: 'Orange', hex: '#F97316' },
    { label: 'Ardoise', hex: '#64748B' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Feedback Banner */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-800 text-sm font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ================= 1. TOP 4 METRICS KPI ROW (Screen Screenshot Match) ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Stations Actives */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E88E5] to-[#0D47A1] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <img
                src={ASSETS.icons.pump}
                alt="Pompes"
                className="w-7 h-7 filter brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Stations Actives</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">48</p>
              <p className="text-[11px] text-slate-400 mt-0.5">sur 52 au total</p>
            </div>
          </div>
          <div className="self-start text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span>↑</span>
            <span>+2</span>
          </div>
        </div>

        {/* KPI 2: Utilisateurs Actifs */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10B981] to-[#047857] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Users className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Utilisateurs Actifs</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">12 540</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ce mois</p>
            </div>
          </div>
          <div className="self-start text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span>↑</span>
            <span>+8%</span>
          </div>
        </div>

        {/* KPI 3: Transactions (Mois) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <img
                src={ASSETS.official.services.panier}
                alt="Transactions"
                className="w-6 h-6 filter brightness-0 invert"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Transactions (Mois)</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">425 880</p>
              <p className="text-[11px] text-slate-400 mt-0.5">FCFA</p>
            </div>
          </div>
          <div className="self-start text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span>↑</span>
            <span>+12%</span>
          </div>
        </div>

        {/* KPI 4: Chiffre d'affaires (Mois) */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
              <TrendingUp className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Chiffre d'affaires (Mois)</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">269 750 000</p>
              <p className="text-[11px] text-slate-400 mt-0.5">FCFA</p>
            </div>
          </div>
          <div className="self-start text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <span>↑</span>
            <span>+15%</span>
          </div>
        </div>
      </section>

      {/* ================= 2. MAIN 2-COLUMN SPLIT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= LEFT MAIN CARD: CRÉER / GÉRER UNE STATION ================= */}
        <section className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 space-y-6">
          {/* Header Title */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Store className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0A1D37]">
                  Créer / Gérer une Station
                </h1>
                <p className="text-xs text-slate-500">
                  Configurez l'identité, l'habillage graphique et les services de chaque station
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500 hidden sm:inline">Statut :</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as Station['status'])}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="active">● Active (En service)</option>
                <option value="maintenance">● En Maintenance</option>
                <option value="closed">● Fermée</option>
              </select>
            </div>
          </div>

          {/* Form Content Grid: 3 Sub-columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Informations Générales */}
            <div className="space-y-3.5">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Informations générales
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de la station <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  placeholder="ex: Station Liberté"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Localisation <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={locationText}
                    onChange={e => setLocationText(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Libreville, Gabon"
                  />
                  <button
                    type="button"
                    title="Géolocaliser"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    placeholder="+241 011 12 34 56"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Votre station de confiance..."
                />
              </div>
            </div>

            {/* 2. Logo & Couleurs de la station */}
            <div className="space-y-3.5">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Logo & Couleurs de la station
              </h2>

              {/* Logo Upload Box (from screenshot) */}
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/70 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-2 p-2">
                  <img
                    src={ASSETS.brand.logoMark}
                    alt="Logo Station"
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Télécharger le logo</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">SVG, PNG ou JPG (max 2 Mo)</p>
              </div>

              {/* Couleur principale */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Couleur principale
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={primaryColor.toUpperCase()}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Couleur secondaire */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={secondaryColor.toUpperCase()}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 3. Aperçu en temps réel */}
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Aperçu en temps réel
              </h2>

              <StationCanopyPreview
                stationName={name}
                locationText={locationText}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                canopyTheme={canopyTheme}
                isOpen={status === 'active'}
                isOpen24h={true}
                status={status}
                mode="full"
              />
            </div>
          </div>

          {/* Middle Row: Produits & Services proposés (6 official SVG cards) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Produits & Services proposés
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {/* 1. Carburants */}
              <button
                type="button"
                onClick={() => setServices(prev => ({ ...prev, carburants: !prev.carburants }))}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  services.carburants
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                }`}
              >
                <img
                  src={ASSETS.official.carburantsGaz.super}
                  alt="Carburants"
                  className="w-8 h-8 object-contain mb-1.5"
                />
                <span className="text-xs font-bold text-slate-800">Carburants</span>
              </button>

              {/* 2. Gaz */}
              <button
                type="button"
                onClick={() => setServices(prev => ({ ...prev, gaz: !prev.gaz }))}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  services.gaz
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                }`}
              >
                <img
                  src={ASSETS.official.carburantsGaz.gazButane}
                  alt="Gaz"
                  className="w-8 h-8 object-contain mb-1.5"
                />
                <span className="text-xs font-bold text-slate-800">Gaz</span>
              </button>

              {/* 3. Lubrifiants */}
              <button
                type="button"
                onClick={() => setServices(prev => ({ ...prev, lubrifiants: !prev.lubrifiants }))}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  services.lubrifiants
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                }`}
              >
                <img
                  src={ASSETS.official.huilesLiquides.huileMoteur}
                  alt="Lubrifiants"
                  className="w-8 h-8 object-contain mb-1.5"
                />
                <span className="text-xs font-bold text-slate-800">Lubrifiants</span>
              </button>

              {/* 4. Boutique */}
              <button
                type="button"
                onClick={() => setServices(prev => ({ ...prev, boutique: !prev.boutique }))}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  services.boutique
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                }`}
              >
                <img
                  src={ASSETS.official.services.panier}
                  alt="Boutique"
                  className="w-8 h-8 object-contain mb-1.5"
                />
                <span className="text-xs font-bold text-slate-800">Boutique</span>
              </button>

              {/* 5. Café */}
              <button
                type="button"
                onClick={() => setServices(prev => ({ ...prev, cafe: !prev.cafe }))}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  services.cafe
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                }`}
              >
                <img
                  src={ASSETS.official.boutiqueSnack.cafe}
                  alt="Café"
                  className="w-8 h-8 object-contain mb-1.5"
                />
                <span className="text-xs font-bold text-slate-800">Café</span>
              </button>

              {/* 6. Lavage */}
              <button
                type="button"
                onClick={() => setServices(prev => ({ ...prev, lavage: !prev.lavage }))}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                  services.lavage
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 opacity-60'
                }`}
              >
                <img
                  src={ASSETS.official.services.lavageAuto}
                  alt="Lavage"
                  className="w-8 h-8 object-contain mb-1.5"
                />
                <span className="text-xs font-bold text-slate-800">Lavage</span>
              </button>
            </div>
          </div>

          {/* Lower Row: Paramètres avancés (3 iOS Switches) */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Paramètres avancés
              </h2>
              <div className="space-y-2.5">
                {/* Switch 1 */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        enableReservations: !prev.enableReservations,
                      }))
                    }
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      advancedSettings.enableReservations ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        advancedSettings.enableReservations ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Activer les réservations
                  </span>
                </label>

                {/* Switch 2 */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        enableMobileMoney: !prev.enableMobileMoney,
                      }))
                    }
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      advancedSettings.enableMobileMoney ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        advancedSettings.enableMobileMoney ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Paiement Mobile Money
                  </span>
                </label>

                {/* Switch 3 */}
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() =>
                      setAdvancedSettings(prev => ({
                        ...prev,
                        enableClientNotifications: !prev.enableClientNotifications,
                      }))
                    }
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                      advancedSettings.enableClientNotifications ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
                        advancedSettings.enableClientNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Notifications clients
                  </span>
                </label>
              </div>
              {/* Toggle to Open Deep 360 Infrastructure Drawer */}
              <button
                type="button"
                onClick={() => setShowDeep360Settings(!showDeep360Settings)}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>{showDeep360Settings ? '▲ Masquer les options 360°' : '▼ Plus d’options d’infrastructure & 360°'}</span>
              </button>
            </div>

            {/* Bottom Form Action Buttons */}
            <div className="flex items-center gap-3 self-end sm:self-center mt-3 sm:mt-0">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Réinitialiser</span>
              </button>

              <button
                type="button"
                onClick={handleSaveStation}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all active:scale-[0.99]"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Enregistrer la station</span>
              </button>
            </div>
          </div>

          {/* EXPANDABLE DEEP 360° CONFIGURATION SECTION */}
          {showDeep360Settings && (
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-blue-200/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-[#0A1D37] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Configuration Approfondie 360° de la Station</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                  Mode Administrateur Avancé
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Code Station */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Station</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                    placeholder="ST-LBV-01"
                  />
                </div>

                {/* Gérant responsable */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gérant responsable</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    placeholder="Alain OBAME"
                  />
                </div>

                {/* Email officiel */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email officiel</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    placeholder="contact@stationpro.ga"
                  />
                </div>

                {/* Téléphone urgence */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone urgence piste</label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono"
                    placeholder="+241 077 00 11 22"
                  />
                </div>
              </div>

              {/* Horaires et services annexes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horaires d'ouverture</label>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOpen24h}
                        onChange={e => setIsOpen24h(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-bold text-slate-800">24h / 24</span>
                    </label>
                    {!isOpen24h && (
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <input
                          type="time"
                          value={openingTime}
                          onChange={e => setOpeningTime(e.target.value)}
                          className="border px-1.5 py-0.5 rounded bg-white"
                        />
                        <span>à</span>
                        <input
                          type="time"
                          value={closingTime}
                          onChange={e => setClosingTime(e.target.value)}
                          className="border px-1.5 py-0.5 rounded bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marchand Airtel Money</label>
                  <input
                    type="text"
                    value={advancedSettings.airtelMoneyNumber}
                    onChange={e => setAdvancedSettings(prev => ({ ...prev, airtelMoneyNumber: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono text-[11px]"
                    placeholder="+241 077 12 34 56"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marchand Moov Money</label>
                  <input
                    type="text"
                    value={advancedSettings.moovMoneyNumber}
                    onChange={e => setAdvancedSettings(prev => ({ ...prev, moovMoneyNumber: e.target.value }))}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-mono text-[11px]"
                    placeholder="+241 066 98 76 54"
                  />
                </div>
              </div>

              {/* Services supplémentaires 360° */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.pneumatiques}
                    onChange={e => setServices(prev => ({ ...prev, pneumatiques: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <img src={ASSETS.official.services.pneumatiques} alt="" className="w-4 h-4 object-contain" />
                  <span>Atelier Pneumatiques & Pression</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={services.mecanique}
                    onChange={e => setServices(prev => ({ ...prev, mecanique: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <img src={ASSETS.official.services.entretienAuto} alt="" className="w-4 h-4 object-contain" />
                  <span>Vidange Rapide & Mécanique</span>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* ================= RIGHT COLUMN: 2 STACKED PANELS ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* ================= PANEL 1: PERSONNALISATION DE L'INTERFACE ================= */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 space-y-4">
            {/* Header with Palette Icon */}
            <div className="flex items-center gap-2.5 text-[#0A1D37]">
              <Palette className="w-5 h-5 text-blue-600" />
              <h2 className="text-sm font-bold">Personnalisation de l'interface</h2>
            </div>

            {/* 3 Subtabs: Thème, Bannière, Disposition */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveThemeTab('theme')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeThemeTab === 'theme'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Thème
              </button>
              <button
                type="button"
                onClick={() => setActiveThemeTab('banner')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeThemeTab === 'banner'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Bannière
              </button>
              <button
                type="button"
                onClick={() => setActiveThemeTab('layout')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  activeThemeTab === 'layout'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Disposition
              </button>
            </div>

            {/* TAB 1: THEME CANOPY & COLORS */}
            {activeThemeTab === 'theme' && (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  {CANOPY_THEMES.map(theme => (
                    <StationCanopyPreview
                      key={theme.id}
                      stationName={name}
                      canopyTheme={theme.id}
                      primaryColor={theme.primary}
                      secondaryColor={theme.secondary}
                      mode="mini"
                      isSelected={canopyTheme === theme.id}
                      onClick={() => {
                        setCanopyTheme(theme.id);
                        setPrimaryColor(theme.primary);
                        setSecondaryColor(theme.secondary);
                      }}
                    />
                  ))}
                </div>

                {/* Couleurs principales: 5 dot swatches */}
                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Couleurs principales
                  </label>
                  <div className="flex items-center gap-3">
                    {PRESET_COLORS.map(c => {
                      const isCurrent = primaryColor.toLowerCase() === c.hex.toLowerCase();
                      return (
                        <button
                          key={c.hex}
                          type="button"
                          title={c.label}
                          onClick={() => setPrimaryColor(c.hex)}
                          className={`w-7 h-7 rounded-full shadow-sm transition-all duration-150 relative flex items-center justify-center ${
                            isCurrent
                              ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {isCurrent && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: BANNER STYLES 360° */}
            {activeThemeTab === 'banner' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Choisissez le style de bannière pour l'en-tête de la station côté client et personnel :
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'canopy', title: 'Auvent 3D Isométrique', desc: 'Rendu temps réel dynamique', preview: ASSETS.scenes.stationFront },
                    { id: 'front', title: 'Façade Architecturale', desc: 'Station complète avec boutique', preview: ASSETS.scenes.boutiqueFront },
                    { id: 'city', title: 'Silhouette Skyline Ville', desc: 'Ambiance métropole moderne', preview: ASSETS.scenes.sidebarCity },
                    { id: 'gradient', title: 'Dégradé Minimaliste', desc: 'Charte graphique épurée', preview: ASSETS.scenes.clientHero },
                  ].map(b => (
                    <div
                      key={b.id}
                      onClick={() => setBannerStyle(b.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        bannerStyle === b.id
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-14 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img src={b.preview} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800">{b.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{b.desc}</p>
                      </div>
                      {bannerStyle === b.id && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: LAYOUT MODES 360° */}
            {activeThemeTab === 'layout' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Définissez la densité spatiale de l'interface :
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'standard', title: 'Standard Spacieux', desc: 'Grand confort visuel, espacements amples' },
                    { id: 'compact', title: 'Compact Moderne', desc: 'Optimisé pour les écrans mobiles & tablettes' },
                    { id: 'dense', title: 'Ultra Dense', desc: 'Densité maximale pour salle de contrôle' },
                  ].map(l => (
                    <div
                      key={l.id}
                      onClick={() => setLayoutStyle(l.id as any)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        layoutStyle === l.id
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{l.title}</p>
                        <p className="text-[10px] text-slate-400">{l.desc}</p>
                      </div>
                      {layoutStyle === l.id && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ================= PANEL 2: GESTION DES STATIONS ================= */}
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/90 space-y-4">
            {/* Header & City Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0A1D37]">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold">Gestion des Stations</h2>
              </div>
            </div>

            {/* City Dropdown Select */}
            <div>
              <select
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">Toutes les villes</option>
                <option value="libreville">Libreville</option>
                <option value="port-gentil">Port-Gentil</option>
                <option value="franceville">Franceville</option>
                <option value="moanda">Moanda</option>
              </select>
            </div>

            {/* List of Stations (from Screenshot) */}
            <div className="space-y-2">
              {filteredStations.map(st => {
                const isSelected = st.id === selectedStationId;
                const isMaint = st.status === 'maintenance';

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStationId(st.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Mini Thumbnail */}
                      <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img
                          src={ASSETS.scenes.stationFront}
                          alt={st.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="leading-tight">
                        <p className="text-xs font-bold text-slate-900">{st.name}</p>
                        <p className="text-[11px] text-slate-500">{st.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          isMaint ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isMaint ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span>{isMaint ? 'Maintenance' : 'Active'}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link to full stations directory */}
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate('/admin/stations')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
              >
                <span>Voir toutes les stations</span>
                <span>→</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
