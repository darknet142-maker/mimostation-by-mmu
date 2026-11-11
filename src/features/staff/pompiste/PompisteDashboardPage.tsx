import React, { useState } from 'react';
import { useAppStore } from '@/hooks/useAppStore';
import { store } from '@/services/store';
import { QRCodeCanvas } from '@/components/ui/QRCodeCanvas';
import { StatusPill } from '@/components/ui/StatusPill';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ASSETS } from '@/config/assets';
import {
  CreditCard,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

export const PompisteDashboardPage: React.FC = () => {
  const { pumps, currentEmployee, tanks, products } = useAppStore(s => ({
    pumps: s.pumps,
    currentEmployee: s.currentEmployee,
    tanks: s.tanks,
    products: s.products,
  }));

  // Pompiste's assigned pump (defaults to Pompe #1 or first assigned pump)
  const assignedPumpNumbers =
    currentEmployee?.assignedPumps && currentEmployee.assignedPumps.length > 0
      ? currentEmployee.assignedPumps
      : [1];

  const [selectedPumpNumber, setSelectedPumpNumber] = useState<number>(assignedPumpNumbers[0] || 1);
  const activePump = pumps.find(p => p.number === selectedPumpNumber) || pumps[0];
  const associatedTank = tanks.find(t => t.fuelType === activePump.fuelType) || tanks[0];

  // Mobile sub-view toggle: 'overview' (Capture 01C / Screen 03) vs 'station_piste' (Capture 04 / Image 6)
  const [mobileSubView, setMobileSubView] = useState<'overview' | 'station_piste'>('station_piste');

  // Modals for Mobile Quick Actions
  const [productsModalOpen, setProductsModalOpen] = useState(false);
  const [tanksModalOpen, setTanksModalOpen] = useState(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentSent, setIncidentSent] = useState(false);

  // Official fixed tariff (non-editable by pompiste)
  const pricePerLiter = activePump.fuelType === 'Super' ? 700 : 650;

  // Distribution configuration states
  const [inputMode, setInputMode] = useState<'liters' | 'amount'>('liters');
  const [selectedPresetLiters, setSelectedPresetLiters] = useState<number | null>(10);
  const [customLiters, setCustomLiters] = useState<string>('2.50');
  const [selectedPresetAmount, setSelectedPresetAmount] = useState<number | null>(null);

  // Computed values
  const currentVolumeLiters =
    inputMode === 'liters'
      ? (selectedPresetLiters !== null ? selectedPresetLiters : parseFloat(customLiters) || 0)
      : ((selectedPresetAmount || 0) / pricePerLiter);

  const currentTotalAmount = Math.round(currentVolumeLiters * pricePerLiter);

  // Payment mode state ('Mobile Money' | 'Espèces' | 'Carte bancaire')
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Espèces' | 'Carte bancaire'>('Mobile Money');

  // Success toast state
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    liters: number;
    amount: number;
    method: string;
  } | null>(null);

  // Underground tank projection after current service
  const projectedRemainingLiters = Math.max(0, associatedTank.currentLiters - currentVolumeLiters);
  const projectedPercent = Math.round((projectedRemainingLiters / associatedTank.capacityLiters) * 100);

  // Dynamic QR Code content representing the live transaction
  const qrPayload = `STATIONPRO-P${activePump.number}-${currentVolumeLiters.toFixed(2)}L-${currentTotalAmount}FCFA-${paymentMethod}-${Date.now()}`;

  // Handle preset selection in Liters mode
  const handleSelectLitersPreset = (liters: number) => {
    setSelectedPresetLiters(liters);
    setCustomLiters(liters.toFixed(2));
  };

  // Handle custom manual input
  const handleCustomLitersChange = (val: string) => {
    setSelectedPresetLiters(null);
    setCustomLiters(val);
  };

  // Handle preset selection in Amount mode
  const handleSelectAmountPreset = (amt: number) => {
    setSelectedPresetAmount(amt);
  };

  // Handle transaction validation
  const handleValidateTransaction = () => {
    if (currentVolumeLiters <= 0) return;

    store.recordFuelTransaction({
      pumpNumber: activePump.number,
      product: activePump.fuelType,
      quantityLiters: currentVolumeLiters,
      amountFCFA: currentTotalAmount,
      paymentMethod: paymentMethod === 'Carte bancaire' ? 'Carte' : paymentMethod,
    });

    setSuccessToast({
      show: true,
      liters: currentVolumeLiters,
      amount: currentTotalAmount,
      method: paymentMethod,
    });

    // Auto-dismiss toast after 4 seconds
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim()) return;

    store.reportIncident(
      `[Pompe #${activePump.number}] ${incidentTitle}`,
      incidentDescription || 'Signalé depuis le poste Pompiste.'
    );
    setIncidentSent(true);
    setTimeout(() => {
      setIncidentSent(false);
      setIncidentModalOpen(false);
      setIncidentTitle('');
      setIncidentDescription('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* ================= MOBILE VIEW SWITCHER PILL (< 1024px) ================= */}
      <div className="flex lg:hidden items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setMobileSubView('overview')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileSubView === 'overview'
              ? 'bg-[#0B3A82] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-4 h-4 object-contain" />
          <span>Vue d'ensemble</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSubView('station_piste')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileSubView === 'station_piste'
              ? 'bg-[#10B981] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <img src={ASSETS.official.services.recu} alt="" className="w-4 h-4 object-contain" />
          <span>Poste & Encaissement</span>
        </button>
      </div>

      {/* ================= SUCCESS BANNER NOTIFICATION ================= */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <img src={ASSETS.official.uiActions.disponible} alt="Succès" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <div className="text-sm font-extrabold flex items-center gap-2">
                <span>Distribution Pompe #{activePump.number} validée avec succès !</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                {successToast.liters.toFixed(2)} L servis • {new Intl.NumberFormat('fr-FR').format(successToast.amount)} FCFA encaissés via {successToast.method}.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-bold transition-colors"
          >
            Fermer
          </button>
        </div>
      )}

      {/* ================= MOBILE OVERVIEW VIEW (SCREEN 01C / SCREEN 03) ================= */}
      {mobileSubView === 'overview' && (
        <div className="space-y-4 lg:hidden animate-in fade-in duration-200">
          {/* Top User Card (Capture 01C) */}
          <div className="bg-white rounded-2xl p-4 border border-[#DBE5F1] shadow-station-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentEmployee?.avatar || ASSETS.avatars.pompiste}
                  alt={currentEmployee?.name || 'Jean Dupont'}
                  className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                />
                <img
                  src={ASSETS.official.uiActions.disponible}
                  alt="Actif"
                  className="w-4 h-4 object-contain absolute bottom-0 right-0"
                />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] leading-tight">Pompiste</h2>
                <p className="text-xs text-slate-500">Bienvenue, {currentEmployee?.name || 'Jean Dupont'}</p>
              </div>
            </div>

            <StatusPill type="active" label="En service" size="sm" />
          </div>

          {/* 4 Large Quick Action Cards (2x2 Grid, Screen 01C) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: Produits dispo */}
            <div
              onClick={() => setProductsModalOpen(true)}
              className="bg-white rounded-2xl p-4 border border-[#DCE4F0] shadow-station-card flex flex-col justify-between cursor-pointer hover:border-blue-400 active:scale-95 transition-all min-h-[120px]"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Produits dispo</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Consulter l'état</p>
              </div>
            </div>

            {/* Card 2: Encaissement -> Directly launches the workstation */}
            <div
              onClick={() => setMobileSubView('station_piste')}
              className="bg-white rounded-2xl p-4 border border-[#DCE4F0] shadow-station-card flex flex-col justify-between cursor-pointer hover:border-blue-400 active:scale-95 transition-all min-h-[120px]"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <img src={ASSETS.official.services.recu} alt="" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Encaissement</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Enregistrer</p>
              </div>
            </div>

            {/* Card 3: Niveaux cuves */}
            <div
              onClick={() => setTanksModalOpen(true)}
              className="bg-white rounded-2xl p-4 border border-[#DCE4F0] shadow-station-card flex flex-col justify-between cursor-pointer hover:border-blue-400 active:scale-95 transition-all min-h-[120px]"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <img src={ASSETS.official.uiActions.niveauCuve} alt="" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Niveaux cuves</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Voir les niveaux</p>
              </div>
            </div>

            {/* Card 4: Incidents */}
            <div
              onClick={() => setIncidentModalOpen(true)}
              className="bg-white rounded-2xl p-4 border border-[#DCE4F0] shadow-station-card flex flex-col justify-between cursor-pointer hover:border-red-400 active:scale-95 transition-all min-h-[120px]"
            >
              <div className="w-10 h-10 flex items-center justify-center mb-1">
                <img src={ASSETS.official.uiActions.alerte} alt="" className="w-9 h-9 object-contain" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Incidents</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Signaler</p>
              </div>
            </div>
          </div>

          {/* Section: Vue rapide station (Capture 01C) */}
          <div className="bg-white rounded-2xl p-4 border border-[#DCE4F0] shadow-station-card space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1668E3]" />
              <h3 className="text-sm font-extrabold text-[#0F172A]">Vue rapide station</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Super */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-8 h-8 object-contain mb-1" />
                <span className="text-xs font-bold text-[#0F172A] mb-1">Super</span>
                <StatusPill type="disponible" size="sm" />
              </div>

              {/* Gazole */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img src={ASSETS.official.carburantsGaz.gasoil} alt="" className="w-8 h-8 object-contain mb-1" />
                <span className="text-xs font-bold text-[#0F172A] mb-1">Gazole</span>
                <StatusPill type="disponible" size="sm" />
              </div>

              {/* Gaz Butane */}
              <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                <img src={ASSETS.official.carburantsGaz.gazButane} alt="" className="w-7 h-8 object-contain mb-1" />
                <span className="text-xs font-bold text-[#0F172A] mb-1">Gaz Butane</span>
                <StatusPill type="disponible" size="sm" />
              </div>
            </div>
          </div>

          {/* Banner: Station opérationnelle (Capture 01C) */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shadow-station-card flex items-center gap-3.5 relative overflow-hidden">
            <img src={ASSETS.official.uiActions.disponible} alt="OK" className="w-9 h-9 object-contain shrink-0 relative z-10" />
            <div className="relative z-10">
              <h4 className="text-sm font-extrabold text-[#0F172A]">Station opérationnelle</h4>
              <p className="text-xs text-slate-500">Tous les services sont disponibles.</p>
            </div>
            <img
              src={ASSETS.scenes.stationFront}
              alt=""
              className="absolute right-0 top-0 bottom-0 w-32 object-cover opacity-20 pointer-events-none"
            />
          </div>
        </div>
      )}

      {/* ================= MAIN OPERATIONAL WORKSPACE (DESKTOP OR MOBILE PUMP WORKSTATION) ================= */}
      <div className={`${mobileSubView === 'overview' ? 'hidden lg:grid' : 'grid'} grid-cols-1 lg:grid-cols-12 gap-6 items-start`}>
        {/* ================= LEFT COLUMN: PUMP INFO & DISTRIBUTION (7 COLS) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Pompe #1 (Super) & Fixed Price Badge */}
          <div className="bg-white rounded-3xl border border-[#DCE4F0] p-6 shadow-station-card flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Official 3D Fuel Graphic */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
              <img
                src={activePump.fuelType === 'Super' ? ASSETS.official.carburantsGaz.super : ASSETS.official.carburantsGaz.gasoil}
                alt={activePump.fuelType}
                className="max-h-28 max-w-28 object-contain drop-shadow-md"
              />
            </div>

            {/* Details & Official Fixed Price */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                  Pompe #{activePump.number} ({activePump.fuelType})
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-[#10B981] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  <img src={ASSETS.official.uiActions.disponible} alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Tarif fixe</span>
                </span>
              </div>

              <div className="text-xs text-slate-500 font-semibold">Tarif fixé :</div>

              {/* High-visibility Blue Price Badge */}
              <div className="inline-block bg-[#0052CC] hover:bg-[#0047b3] text-white font-extrabold text-2xl sm:text-3xl px-6 py-2.5 rounded-2xl shadow-md tracking-tight transition-colors">
                {pricePerLiter} FCFA / Litre
              </div>
            </div>

            {/* Multiple pumps switcher if pompiste has more than 1 pump */}
            {assignedPumpNumbers.length > 1 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {assignedPumpNumbers.map(pNum => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setSelectedPumpNumber(pNum)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      selectedPumpNumber === pNum
                        ? 'bg-[#1668E3] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pompe #{pNum}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Fuel Distribution Configuration & Calculated Output */}
          <div className="bg-white rounded-3xl border border-[#DCE4F0] p-6 shadow-station-card space-y-5">
            {/* Mode Switch Tabs (Litres vs Montant FCFA) */}
            <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setInputMode('liters')}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'liters'
                    ? 'bg-[#0052CC] text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-4 h-4 object-contain" />
                <span>Saisir en Litres (L)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMode('amount');
                  setSelectedPresetAmount(selectedPresetAmount || 10000);
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                  inputMode === 'amount'
                    ? 'bg-[#0052CC] text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <img src={ASSETS.official.services.recu} alt="" className="w-4 h-4 object-contain" />
                <span>Saisir en Montant (FCFA)</span>
              </button>
            </div>

            {/* Section Title */}
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                {inputMode === 'liters'
                  ? 'Volume de carburant à servir (Litres)'
                  : 'Montant de carburant à servir (FCFA)'}
              </h3>
            </div>

            {/* Preset Buttons Grid */}
            {inputMode === 'liters' ? (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {[10, 20, 30, 50].map(liters => {
                  const isSelected = selectedPresetLiters === liters;
                  return (
                    <button
                      key={liters}
                      type="button"
                      onClick={() => handleSelectLitersPreset(liters)}
                      className={`relative py-3.5 sm:py-4 px-2 rounded-2xl font-black text-base sm:text-lg transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0052CC] text-white shadow-md scale-[1.02]'
                          : 'bg-white border-2 border-[#DCE4F0] text-[#0F172A] hover:border-blue-400 active:scale-95'
                      }`}
                    >
                      <span>{liters} L</span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-[#0052CC] flex items-center justify-center text-xs font-black shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {[2000, 5000, 10000, 20000].map(amt => {
                  const isSelected = selectedPresetAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleSelectAmountPreset(amt)}
                      className={`relative py-3.5 sm:py-4 px-2 rounded-2xl font-black text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0052CC] text-white shadow-md scale-[1.02]'
                          : 'bg-white border-2 border-[#DCE4F0] text-[#0F172A] hover:border-blue-400 active:scale-95'
                      }`}
                    >
                      <span>{new Intl.NumberFormat('fr-FR').format(amt)} F</span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white text-[#0052CC] flex items-center justify-center text-xs font-black shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Optional Manual Stepper / Input Field */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Saisie précise ou libre :</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={inputMode === 'liters' ? (selectedPresetLiters !== null ? selectedPresetLiters : customLiters) : (selectedPresetAmount || 0)}
                  onChange={e => {
                    if (inputMode === 'liters') handleCustomLitersChange(e.target.value);
                    else setSelectedPresetAmount(parseFloat(e.target.value) || 0);
                  }}
                  className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm font-bold font-mono text-center text-[#0B3A82] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-500">
                  {inputMode === 'liters' ? 'Litres' : 'FCFA'}
                </span>
              </div>
            </div>

            {/* Calculated Values Container (Light Blue Box) */}
            <div className="bg-[#EEF4FD] rounded-2xl border border-[#DCE8FB] p-5 space-y-4">
              {/* Row 1: Quantité calculée */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center p-1.5 shrink-0">
                  <img src={ASSETS.official.carburantsGaz.super} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Quantité calculée :</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A82] font-mono tracking-tight">
                    {currentVolumeLiters.toFixed(2)} Litres
                  </div>
                </div>
              </div>

              {/* Row 2: Total à encaisser */}
              <div className="flex items-center gap-3 pt-1 border-t border-blue-200/50">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center p-1.5 shrink-0">
                  <img src={ASSETS.official.services.recu} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs text-slate-600 font-semibold">Total à encaisser :</div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0B3A82] font-mono tracking-tight">
                    {new Intl.NumberFormat('fr-FR').format(currentTotalAmount)} FCFA
                  </div>
                </div>
              </div>
            </div>

            {/* Underground Tank Level Simulator Bar */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 p-1">
                  <img src={ASSETS.official.uiActions.niveauCuve} alt="" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Niveau cuve après service :</div>
                  <div className="text-sm font-extrabold text-emerald-600 font-mono">
                    {projectedRemainingLiters.toLocaleString('fr-FR', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{' '}
                    L restants
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-28 sm:w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${projectedPercent}%` }}
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700">≈ {projectedPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PAYMENT MODE, QR CODE & VALIDATE (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DCE4F0] p-6 shadow-station-card space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Card Header: Mode d'encaissement */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <CreditCard className="w-5 h-5 text-[#0B3A82]" />
              <h2 className="text-base font-extrabold text-[#0F172A]">Mode d'encaissement</h2>
            </div>

            {/* 3 Payment Method Selectors */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Option 1: Mobile Money */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Mobile Money')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between transition-all relative ${
                  paymentMethod === 'Mobile Money'
                    ? 'border-2 border-[#1668E3] bg-[#F0F5FD] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="relative my-1">
                  <img src={ASSETS.official.services.qrCode} alt="Mobile Money" className="w-7 h-7 object-contain" />
                  {paymentMethod === 'Mobile Money' && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px] font-black">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-xs font-extrabold text-[#0F172A] mt-1">Mobile Money</div>
                <div className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  (Airtel Money / Moov Money)
                </div>
              </button>

              {/* Option 2: Espèces */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Espèces')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between transition-all ${
                  paymentMethod === 'Espèces'
                    ? 'border-2 border-[#1668E3] bg-[#F0F5FD] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="my-1">
                  <img src={ASSETS.official.services.recu} alt="Espèces" className="w-7 h-7 object-contain" />
                </div>
                <div className="text-xs font-extrabold text-[#0F172A] mt-1">Espèces</div>
                <div className="text-[9px] text-slate-400 leading-tight mt-0.5">Cash direct</div>
              </button>

              {/* Option 3: Carte bancaire */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Carte bancaire')}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between transition-all ${
                  paymentMethod === 'Carte bancaire'
                    ? 'border-2 border-[#1668E3] bg-[#F0F5FD] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="my-1">
                  <CreditCard className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-xs font-extrabold text-[#0F172A] mt-1">Carte bancaire</div>
                <div className="text-[9px] text-slate-400 leading-tight mt-0.5">TPE / Visa</div>
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="bg-[#EEF4FD] border border-[#DCE8FB] p-3 rounded-2xl flex items-center gap-2.5">
              <img src={ASSETS.official.uiActions.information} alt="" className="w-5 h-5 object-contain shrink-0" />
              <p className="text-xs font-semibold text-[#0B3A82]">
                Scannez le QR Code ou présentez-le au caissier.
              </p>
            </div>

            {/* Dynamic Scannable QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <QRCodeCanvas value={qrPayload} size={150} />
              </div>
              <div className="mt-2 text-[11px] font-mono font-bold text-slate-500">
                POMPE #{activePump.number} • {currentVolumeLiters.toFixed(2)} L
              </div>
            </div>
          </div>

          {/* Large Full-Width Green Validation Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleValidateTransaction}
              className="w-full py-4 px-6 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all cursor-pointer"
            >
              <img src={ASSETS.official.uiActions.disponible} alt="" className="w-6 h-6 object-contain" />
              <span>Valider la distribution & Encaisser</span>
              <ChevronRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL: PRODUITS DISPO ================= */}
      {productsModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setProductsModalOpen(false)}
          title="Produits disponibles à la station"
          subtitle="État des stocks et tarifs en vigueur"
          maxWidth="md"
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {products.slice(0, 8).map(prod => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <img src={prod.image} alt={prod.name} className="w-9 h-9 object-contain" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{prod.name}</h4>
                    <p className="text-[11px] text-slate-500">{prod.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#0B3A82]">
                    {new Intl.NumberFormat('fr-FR').format(prod.priceFCFA)} F
                  </span>
                  <StatusPill type="disponible" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ================= MODAL: NIVEAUX CUVES ================= */}
      {tanksModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setTanksModalOpen(false)}
          title="Niveaux des cuves souterraines"
          subtitle="Suivi en temps réel des jauges de carburant et gaz"
          maxWidth="md"
        >
          <div className="space-y-4">
            {tanks.map(tank => (
              <div key={tank.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={ASSETS.official.uiActions.niveauCuve} alt="" className="w-6 h-6 object-contain" />
                    <div>
                      <h4 className="text-sm font-bold text-[#0F172A]">{tank.fuelType}</h4>
                      <p className="text-xs text-slate-500">Capacité : {tank.capacityLiters.toLocaleString('fr-FR')} L</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#0B3A82] font-mono">
                    {tank.currentLiters.toLocaleString('fr-FR')} L ({tank.levelPercent}%)
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${tank.levelPercent}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${
                      tank.levelPercent > 30 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ================= MODAL: SIGNALER UN INCIDENT ================= */}
      {incidentModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIncidentModalOpen(false)}
          title="Signaler une anomalie / incident"
          subtitle={`Pompe #${activePump.number} • ${activePump.fuelType}`}
          maxWidth="sm"
        >
          {incidentSent ? (
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <img src={ASSETS.official.uiActions.disponible} alt="Envoyé" className="w-14 h-14 object-contain animate-bounce" />
              <h4 className="text-base font-extrabold text-[#0F172A]">Incident transmis au Chef de Poste !</h4>
              <p className="text-xs text-slate-500">L'équipe a été notifiée instantanément.</p>
            </div>
          ) : (
            <form onSubmit={handleReportIncident} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Type d'incident / problème
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Pistolet bloqué, fuite légère, TPE éteint"
                  value={incidentTitle}
                  onChange={e => setIncidentTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Détails ou précisions (optionnel)
                </label>
                <textarea
                  rows={3}
                  placeholder="Préciser l'état de la pompe ou du matériel..."
                  value={incidentDescription}
                  onChange={e => setIncidentDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="danger"
                  size="md"
                  fullWidth
                  type="submit"
                  icon={<AlertTriangle className="w-4 h-4" />}
                >
                  Envoyer le signalement d'urgence
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
