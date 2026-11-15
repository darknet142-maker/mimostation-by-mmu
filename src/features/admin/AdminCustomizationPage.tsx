import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Station, NetworkConfig, OperatorId } from '@/types';
import { OPERATORS, getOperator, resolveStationBranding, readSvgFile } from '@/config/operators';
import { StationCover } from '@/components/station/StationCover';
import {
  StationCanopyPreview,
  CANOPY_THEMES,
} from '@/components/admin/StationCanopyPreview';
import {
  Palette,
  Check,
  CheckCircle2,
  Building,
  Sparkles,
  Upload,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

export const AdminCustomizationPage: React.FC = () => {
  const { stations, networkConfig } = useAppStore(s => ({
    stations: s.stations || [],
    networkConfig: s.networkConfig,
  }));

  const [activeTab, setActiveTab] = useState<'station' | 'platform'>('station');

  const [selectedStationId, setSelectedStationId] = useState<string>(
    stations[0]?.id || 'station-liberte'
  );
  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const [operatorId, setOperatorId] = useState<OperatorId>(
    currentStation?.operatorId || 'totalenergies'
  );
  const [primaryColor, setPrimaryColor] = useState(currentStation?.primaryColor || '#0B4DB3');
  const [secondaryColor, setSecondaryColor] = useState(currentStation?.secondaryColor || '#FFC107');
  const [canopyTheme, setCanopyTheme] = useState<Station['canopyTheme']>(
    currentStation?.canopyTheme || 'classic-blue'
  );
  const [bannerStyle, setBannerStyle] = useState<NonNullable<Station['bannerStyle']>>(
    currentStation?.bannerStyle || 'image'
  );
  const [layoutStyle, setLayoutStyle] = useState<NonNullable<Station['layoutStyle']>>(
    currentStation?.layoutStyle || 'standard'
  );
  const [logoUrl, setLogoUrl] = useState<string>(currentStation?.logoUrl || '');
  const [coverImage, setCoverImage] = useState<string>(currentStation?.coverImage || '');
  const [airtelMoneyNumber, setAirtelMoneyNumber] = useState<string>(
    currentStation?.advancedSettings?.airtelMoneyNumber || '+241 074 00 00 00'
  );
  const [moovMoneyNumber, setMoovMoneyNumber] = useState<string>(
    currentStation?.advancedSettings?.moovMoneyNumber || '+241 066 00 00 00'
  );
  const [svgError, setSvgError] = useState<string | null>(null);

  // Platform level states 360°
  const [platformName, setPlatformName] = useState(networkConfig?.platformName || 'StationPro');
  const [platformSlogan, setPlatformSlogan] = useState(
    networkConfig?.platformSlogan || "Console d'administration des stations-services"
  );
  const [currency, setCurrency] = useState(networkConfig?.currency || 'FCFA');
  const [supportPhone, setSupportPhone] = useState(networkConfig?.supportPhone || '+241 011 88 99 00');
  const [supportEmail, setSupportEmail] = useState(networkConfig?.supportEmail || 'support@stationpro.ga');
  const [systemTheme, setSystemTheme] = useState<NetworkConfig['systemTheme']>(
    networkConfig?.systemTheme || 'navy-pro'
  );

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const handleSelectStation = (id: string) => {
    setSelectedStationId(id);
    setSvgError(null);
    const target = stations.find(s => s.id === id);
    if (target) {
      const resolved = resolveStationBranding(target);
      setOperatorId(target.operatorId || resolved.operator?.id || 'totalenergies');
      setPrimaryColor(target.primaryColor || resolved.primaryColor);
      setSecondaryColor(target.secondaryColor || resolved.secondaryColor);
      setCanopyTheme(target.canopyTheme || resolved.operator?.canopyTheme || 'classic-blue');
      setBannerStyle(target.bannerStyle || 'image');
      setLayoutStyle(target.layoutStyle || 'standard');
      setLogoUrl(target.logoUrl || '');
      setCoverImage(target.coverImage || '');
      setAirtelMoneyNumber(target.advancedSettings?.airtelMoneyNumber || '+241 074 00 00 00');
      setMoovMoneyNumber(target.advancedSettings?.moovMoneyNumber || '+241 066 00 00 00');
    }
  };

  const handleOperatorChange = (opId: OperatorId) => {
    setOperatorId(opId);
    const op = getOperator(opId);
    if (op) {
      setPrimaryColor(op.primaryColor);
      setSecondaryColor(op.secondaryColor);
      setCanopyTheme(op.canopyTheme);
    }
  };

  const handleSvgUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'cover'
  ) => {
    setSvgError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readSvgFile(file);
      if (target === 'logo') setLogoUrl(dataUrl);
      else setCoverImage(dataUrl);
    } catch (err) {
      setSvgError(err instanceof Error ? err.message : 'Erreur lors du chargement SVG.');
    } finally {
      e.target.value = '';
    }
  };

  const handleApplyCustomization = () => {
    if (!currentStation) return;
    store.updateStationCustomization(selectedStationId, {
      operatorId,
      primaryColor,
      secondaryColor,
      canopyTheme,
      bannerStyle,
      layoutStyle,
      logoUrl: logoUrl || undefined,
      coverImage: coverImage || undefined,
      advancedSettings: {
        enableReservations: currentStation.advancedSettings?.enableReservations ?? true,
        enableMobileMoney: currentStation.advancedSettings?.enableMobileMoney ?? true,
        enableClientNotifications: currentStation.advancedSettings?.enableClientNotifications ?? true,
        airtelMoneyNumber: airtelMoneyNumber.trim() || undefined,
        moovMoneyNumber: moovMoneyNumber.trim() || undefined,
      },
    });
    setSavedSuccess(`Habillage 360° de "${currentStation.name}" enregistré et synchronisé !`);
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const handleApplyPlatformConfig = () => {
    store.updateNetworkConfig({
      platformName,
      platformSlogan,
      currency,
      supportPhone,
      supportEmail,
      systemTheme,
    });
    setSavedSuccess('Configuration globale de la plateforme enregistrée avec succès !');
    setTimeout(() => setSavedSuccess(null), 3500);
  };

  const PALETTE_SWATCHES = [
    { label: 'Bleu Royal', hex: '#0B4DB3' },
    { label: 'Or / Jaune', hex: '#FFC107' },
    { label: 'Violet Imperial', hex: '#8B5CF6' },
    { label: 'Orange Énergie', hex: '#F97316' },
    { label: 'Vert Émeraude', hex: '#059669' },
    { label: 'Cyan Tech', hex: '#0284C7' },
    { label: 'Rouge Total', hex: '#DC2626' },
    { label: 'Gris Ardoise', hex: '#64748B' },
  ];

  const previewBranding = resolveStationBranding({
    id: selectedStationId,
    operatorId,
    logoUrl: logoUrl || undefined,
    coverImage: coverImage || undefined,
    primaryColor,
    secondaryColor,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Palette className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Studio de Marque 360°</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Personnalisation &amp; Habillage des Stations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configurez l&apos;enseigne SVG, la couverture, la charte graphique, la disposition et les comptes marchands
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStationId}
            onChange={e => handleSelectStation(e.target.value)}
            aria-label="Station à personnaliser"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {stations.map(st => (
              <option key={st.id} value={st.id}>
                {st.name} ({st.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('station')}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'station'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Habillage par Station (Enseigne SVG, Auvent &amp; Encaissement)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('platform')}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'platform'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Marque Blanche &amp; Plateforme Globale 360°
        </button>
      </div>

      {savedSuccess && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {svgError && (
        <div
          role="alert"
          className="p-3.5 bg-red-50 border border-red-300 rounded-2xl flex items-center gap-2 text-red-800 text-xs sm:text-sm font-semibold shadow-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{svgError}</span>
        </div>
      )}

      {/* VIEW 1: STATION LEVEL CUSTOMIZATION */}
      {activeTab === 'station' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Controls */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-5">
            {/* Operator Brand Selector */}
            <div className="space-y-2">
              <label htmlFor="operator-select" className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Enseigne Pétrolière Officielle
              </label>
              <select
                id="operator-select"
                value={operatorId}
                onChange={e => handleOperatorChange(e.target.value as OperatorId)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
              >
                {OPERATORS.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.legalName}
                  </option>
                ))}
              </select>
            </div>

            {/* SVG Upload & Overrides */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Logo &amp; Couverture SVG personnalisés (&lt; 128 Ko)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importer Logo SVG</span>
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    className="sr-only"
                    onChange={e => handleSvgUpload(e, 'logo')}
                  />
                </label>

                <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-800 font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Couverture SVG</span>
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    className="sr-only"
                    onChange={e => handleSvgUpload(e, 'cover')}
                  />
                </label>
              </div>

              {(logoUrl || coverImage) && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoUrl('');
                    setCoverImage('');
                    setSvgError(null);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurer les visuels SVG de l&apos;enseigne</span>
                </button>
              )}
            </div>

            {/* Banner & Layout Styles */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label htmlFor="banner-style-select" className="font-bold text-slate-700 mb-1 block">
                  Style de bannière
                </label>
                <select
                  id="banner-style-select"
                  value={bannerStyle}
                  onChange={e => setBannerStyle(e.target.value as NonNullable<Station['bannerStyle']>)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="image">Image SVG enseigne</option>
                  <option value="gradient">Dégradé charte</option>
                  <option value="minimal">Épuré</option>
                </select>
              </div>
              <div>
                <label htmlFor="layout-style-select" className="font-bold text-slate-700 mb-1 block">
                  Densité d&apos;affichage
                </label>
                <select
                  id="layout-style-select"
                  value={layoutStyle}
                  onChange={e => setLayoutStyle(e.target.value as NonNullable<Station['layoutStyle']>)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="standard">Standard</option>
                  <option value="compact">Compacte</option>
                  <option value="dense">Dense (grille serrée)</option>
                </select>
              </div>
            </div>

            {/* Merchant Mobile Money Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <label htmlFor="airtel-num" className="font-bold text-slate-700 mb-1 block">
                  N° Marchand Airtel Money
                </label>
                <input
                  id="airtel-num"
                  type="text"
                  value={airtelMoneyNumber}
                  onChange={e => setAirtelMoneyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>
              <div>
                <label htmlFor="moov-num" className="font-bold text-slate-700 mb-1 block">
                  N° Marchand Moov Money
                </label>
                <input
                  id="moov-num"
                  type="text"
                  value={moovMoneyNumber}
                  onChange={e => setMoovMoneyNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>
            </div>

            {/* Canopy Themes */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Thème d&apos;Auvent 3D</span>
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">6 styles</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {CANOPY_THEMES.map(theme => (
                  <StationCanopyPreview
                    key={theme.id}
                    stationName={currentStation?.name || 'Station'}
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
            </div>

            {/* Color Palettes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Couleur Principale &amp; Secondaire
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {PALETTE_SWATCHES.map(c => {
                  const isSelected = primaryColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      aria-label={`Couleur principale ${c.label}`}
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`w-7 h-7 rounded-full shadow-sm transition-all relative flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Sélecteur couleur principale"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <span className="font-mono font-bold text-slate-700 uppercase">{primaryColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    aria-label="Sélecteur couleur secondaire"
                    value={secondaryColor}
                    onChange={e => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                  />
                  <span className="font-mono font-bold text-slate-700 uppercase">{secondaryColor}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={handleApplyCustomization}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Appliquer cet habillage 360°</span>
              </button>
            </div>
          </div>

          {/* Right: Real-time Live Rendering Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Aperçu Client &amp; Auvent 3D • {currentStation?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Rendu direct de la couverture enseigne, du logo et de la densité ({layoutStyle})
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                Live Preview
              </span>
            </div>

            <StationCover
              coverSrc={previewBranding.cover}
              logoSrc={previewBranding.logo}
              stationName={currentStation?.name || 'Station'}
              operatorName={previewBranding.operator?.name}
              locationText={`${currentStation?.city || 'Libreville'}, ${currentStation?.country || 'Gabon'}`}
              status={currentStation?.status}
              isOpen={currentStation?.isOpen}
              isOpen24h={currentStation?.isOpen24h}
              variant="hero"
            />

            <StationCanopyPreview
              stationName={currentStation?.name || 'Station'}
              locationText={`${currentStation?.city || 'Libreville'}, ${currentStation?.country || 'Gabon'}`}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              canopyTheme={canopyTheme}
              isOpen={currentStation?.isOpen ?? true}
              isOpen24h={currentStation?.isOpen24h ?? true}
              status={currentStation?.status || 'active'}
              mode="full"
            />
          </div>
        </div>
      ) : (
        /* VIEW 2: GLOBAL 360° PLATFORM BRANDING & WHITE-LABEL */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-[#0A1D37]">
              Personnalisation Marque Blanche de la Plateforme (360°)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Configurez le nom du réseau, la devise, le slogan et la charte globale de l&apos;application
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nom de la Plateforme (Marque)</label>
              <input
                type="text"
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white text-sm font-bold"
                placeholder="ex: StationPro / TotalEnergies / PetroGabon"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Devise Réseau Officielle</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 text-sm font-semibold"
              >
                <option value="FCFA">FCFA (Franc CFA - CEMAC / UEMOA)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="USD">USD ($ - Dollar US)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Slogan de la Marque</label>
              <input
                type="text"
                value={platformSlogan}
                onChange={e => setPlatformSlogan(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white"
                placeholder="Gérer • Servir • Performer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Support Officiel</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50"
                placeholder="support@stationpro.ga"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hotline Assistance 24/7</label>
              <input
                type="text"
                value={supportPhone}
                onChange={e => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-mono"
                placeholder="+241 011 88 99 00"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-2">Thème Visuel Console d&apos;Administration</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    { id: 'navy-pro', label: 'Bleu Marine Pro', color: '#0A1D37' },
                    { id: 'slate-dark', label: 'Nuit Ardoise', color: '#0F172A' },
                    { id: 'emerald-clean', label: 'Émeraude Énergie', color: '#064E3B' },
                    { id: 'royal-blue', label: 'Saphir Royal', color: '#1E3A8A' },
                  ] as const satisfies ReadonlyArray<{
                    id: NetworkConfig['systemTheme'];
                    label: string;
                    color: string;
                  }>
                ).map(th => (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setSystemTheme(th.id)}
                    aria-pressed={systemTheme === th.id}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      systemTheme === th.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: th.color }} />
                    <span className="font-bold text-slate-800 text-xs">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleApplyPlatformConfig}
              className="px-6 py-2.5 rounded-xl bg-[#0B4DB3] hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Enregistrer la charte globale</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
