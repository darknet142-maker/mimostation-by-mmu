import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { Station } from '@/types';
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
} from 'lucide-react';

export const AdminCustomizationPage: React.FC = () => {
  const { stations, networkConfig } = useAppStore(s => ({
    stations: s.stations || [],
    networkConfig: s.networkConfig,
  }));

  const [activeTab, setActiveTab] = useState<'station' | 'platform'>('station');

  // Station level states
  const [selectedStationId, setSelectedStationId] = useState<string>(
    stations[0]?.id || 'station-liberte'
  );
  const currentStation = stations.find(s => s.id === selectedStationId) || stations[0];

  const [primaryColor, setPrimaryColor] = useState(currentStation?.primaryColor || '#0B4DB3');
  const [secondaryColor, setSecondaryColor] = useState(currentStation?.secondaryColor || '#FFC107');
  const [canopyTheme, setCanopyTheme] = useState<Station['canopyTheme']>(
    currentStation?.canopyTheme || 'classic-blue'
  );

  // Platform level states 360°
  const [platformName, setPlatformName] = useState(networkConfig?.platformName || 'StationPro');
  const [platformSlogan, setPlatformSlogan] = useState(
    networkConfig?.platformSlogan || "Console d'administration des stations-services"
  );
  const [currency, setCurrency] = useState(networkConfig?.currency || 'FCFA');
  const [supportPhone, setSupportPhone] = useState(networkConfig?.supportPhone || '+241 011 88 99 00');
  const [supportEmail, setSupportEmail] = useState(networkConfig?.supportEmail || 'support@stationpro.ga');
  const [systemTheme, setSystemTheme] = useState(networkConfig?.systemTheme || 'navy-pro');

  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const handleSelectStation = (id: string) => {
    setSelectedStationId(id);
    const target = stations.find(s => s.id === id);
    if (target) {
      setPrimaryColor(target.primaryColor || '#0B4DB3');
      setSecondaryColor(target.secondaryColor || '#FFC107');
      setCanopyTheme(target.canopyTheme || 'classic-blue');
    }
  };

  const handleApplyCustomization = () => {
    if (!currentStation) return;
    store.updateStationCustomization(selectedStationId, {
      primaryColor,
      secondaryColor,
      canopyTheme,
    });
    setSavedSuccess(`Habillage de la station "${currentStation.name}" mis à jour avec succès !`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Palette className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Studio de Marque</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0A1D37]">
            Personnalisation & Habillage des Stations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Personnalisez la charte graphique, les auvents 3D et les couleurs de chaque station du réseau
          </p>
        </div>

        {/* Station Selector Pill */}
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStationId}
            onChange={e => handleSelectStation(e.target.value)}
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

      {/* Navigation Subtabs 360° */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('station')}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'station'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Habillage par Station (Auvent 3D & Couleurs)
        </button>
        <button
          onClick={() => setActiveTab('platform')}
          className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'platform'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Marque Blanche & Plateforme Globale 360°
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* VIEW 1: STATION LEVEL CUSTOMIZATION */}
      {activeTab === 'station' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Interactive Controls */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-6">
            {/* Canopy Themes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Choix du Thème d'Auvent (Canopy)</span>
                </label>
                <span className="text-[11px] text-blue-600 font-semibold">6 styles disponibles</span>
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
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Couleur Principale (Façade & Totem)
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PALETTE_SWATCHES.map(c => {
                  const isSelected = primaryColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => setPrimaryColor(c.hex)}
                      className={`w-8 h-8 rounded-full shadow-sm transition-all duration-150 relative flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
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
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Couleur Secondaire (Liseré & Badges)
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PALETTE_SWATCHES.map(c => {
                  const isSelected = secondaryColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => setSecondaryColor(c.hex)}
                      className={`w-8 h-8 rounded-full shadow-sm transition-all duration-150 relative flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-offset-2 ring-amber-500 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
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
                  className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase"
                />
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
                <span>Appliquer cet habillage</span>
              </button>
            </div>
          </div>

          {/* Right: Real-time Live Rendering Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Rendu 3D en Temps Réel • {currentStation?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Visualisation vectorielle haute précision selon les couleurs et thèmes choisis
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                Live Preview
              </span>
            </div>

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

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">
                Impact de l'habillage sur l'expérience :
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>L'auvent 3D est affiché dans la fiche détaillée de la station côté Client.</li>
                <li>Les bannières d'en-tête de l'espace Pompiste et Chef de Poste s'adaptent aux couleurs de la station.</li>
                <li>Le totem numérique affiche les prix réels en direct.</li>
              </ul>
            </div>
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
              Configurez le nom du réseau, la devise, le slogan et la charte globale de l'application
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
              <label className="block font-bold text-slate-700 mb-2">Thème Visuel Console d'Administration</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'navy-pro', label: 'Bleu Marine Pro', color: '#0A1D37' },
                  { id: 'slate-dark', label: 'Nuit Ardoise', color: '#0F172A' },
                  { id: 'emerald-clean', label: 'Émeraude Énergie', color: '#064E3B' },
                  { id: 'royal-blue', label: 'Saphir Royal', color: '#1E3A8A' },
                ].map(th => (
                  <div
                    key={th.id}
                    onClick={() => setSystemTheme(th.id as any)}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                      systemTheme === th.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: th.color }} />
                    <span className="font-bold text-slate-800 text-xs">{th.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
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
